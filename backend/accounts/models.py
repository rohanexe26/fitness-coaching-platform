from datetime import date
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

class UserProfile(models.Model):
    
    # Modern Django Choices Classes
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        TRAINER = 'trainer', 'Trainer'
        USER = 'user', 'User'

    class Goal(models.TextChoices):
        SLIM = 'slim', 'Get Slim / Fat Loss'
        GAIN = 'gain', 'Gain Muscle / Hypertrophy'
        MAINTAIN = 'maintain', 'Maintain Current Weight'

    class ActivityLevel(models.TextChoices):
        SEDENTARY = 'sedentary', 'Little to no exercise'
        LIGHT = 'light', 'Light exercise (1-3 days/week)'
        MODERATE = 'moderate', 'Moderate exercise (3-5 days/week)'
        ACTIVE = 'active', 'Heavy exercise (6-7 days/week)'

    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'

    class Specialization(models.TextChoices):
        HYPERTROPHY = 'hypertrophy', 'Body Recomposition & Hypertrophy'
        ATHLETIC = 'athletic', 'Athletic Performance & Conditioning'
        MOBILITY = 'mobility', 'Functional Mobility & Injury Rehab'
        GENERAL = 'general', 'General Health & Weight Management'

    # Base Core Fields
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)

    # Member Biological & Fitness Goal Onboarding Fields
    gender = models.CharField(max_length=1, choices=Gender.choices, default=Gender.MALE)
    
    # REPAIR GATE: Maintained for real-time Date Picker mapping sync
    date_of_birth = models.DateField(null=True, blank=True)
    
    age = models.IntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(10), MaxValueValidator(120)]
    )
    weight = models.FloatField(
        help_text="Weight in kilograms (kg)", 
        null=True, blank=True,
        validators=[MinValueValidator(20.0), MaxValueValidator(300.0)]
    )
    height = models.FloatField(
        help_text="Height in centimeters (cm)", 
        null=True, blank=True,
        validators=[MinValueValidator(50.0), MaxValueValidator(300.0)]
    )
    fitness_goal = models.CharField(max_length=10, choices=Goal.choices, default=Goal.MAINTAIN)
    activity_level = models.CharField(max_length=15, choices=ActivityLevel.choices, default=ActivityLevel.SEDENTARY)

    # Professional Trainer Specific Tracking Fields
    specialization = models.CharField(max_length=20, choices=Specialization.choices, default=Specialization.GENERAL, blank=True)
    bio_title = models.CharField(max_length=150, default="Certified Fitness Coach", blank=True)
    max_capacity = models.IntegerField(default=15, blank=True, validators=[MinValueValidator(1), MaxValueValidator(100)])
    is_accepting_clients = models.BooleanField(default=True)
    experience_years = models.IntegerField(default=2, blank=True, validators=[MinValueValidator(0), MaxValueValidator(60)])

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        """
        Overridden save method to automatically calculate and cache the age integer
        directly into the model field database column when date_of_birth is modified.
        """
        if self.date_of_birth:
            # Handle standard timestamp string conversions safely if needed
            if isinstance(self.date_of_birth, str):
                from django.utils.dateparse import parse_date
                self.date_of_birth = parse_date(self.date_of_birth)
            
            if self.date_of_birth:
                today = date.today()
                # Subtract born year from current calendar year tracking timeline
                calculated_age = today.year - self.date_of_birth.year - (
                    (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
                )
                self.age = max(10, min(calculated_age, 120)) # Clamp values to matching validator boundaries

        super().save(*args, **kwargs)

    @property
    def bmi(self):
        """
        Dynamically calculates Body Mass Index (BMI).
        Formula: weight (kg) / height (m)^2
        """
        if self.height and self.weight:
            height_in_meters = self.height / 100
            return round(self.weight / (height_in_meters ** 2), 1)
        return 0 

    @property
    def calculated_macros(self):
        """
        Calculates baseline caloric and protein targets using the Mifflin-St Jeor formula
        multiplied by a dynamic activity factor based on user selection.
        """
        # Fixed: Safely fall back to fallback base numbers instead of crashing out views logic layers
        w = self.weight if self.weight else 70.0
        h = self.height if self.height else 170.0
        a = self.age if self.age else 25
            
        # 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
        bmr = (10 * w) + (6.25 * h) - (5 * a)
        
        if self.gender == self.Gender.FEMALE:
            bmr -= 161
        else:
            bmr += 5 # Defaults to Male offset calculation metrics comfortably
        
        # 2. Dynamic Total Daily Energy Expenditure (TDEE) Multipliers
        activity_multipliers = {
            self.ActivityLevel.SEDENTARY: 1.2,
            self.ActivityLevel.LIGHT: 1.375,
            self.ActivityLevel.MODERATE: 1.55,
            self.ActivityLevel.ACTIVE: 1.725
        }
        multiplier = activity_multipliers.get(self.activity_level, 1.2)
        tdee = bmr * multiplier 
        
        # 3. Apply variations based on selected objective rules
        if self.fitness_goal == self.Goal.SLIM:
            target_calories = tdee - 500       
            target_protein = w * 2.2 
        elif self.fitness_goal == self.Goal.GAIN:
            target_calories = tdee + 350       
            target_protein = w * 2.0 
        else:
            target_calories = tdee             
            target_protein = w * 1.8

        return {
            "calories": round(target_calories),
            "protein": round(target_protein)
        }
