from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class User(AbstractUser):
    """Modèle utilisateur étendu"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True)
    culinary_level = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Niveau de compétence culinaire (1-5)"
    )
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class DietaryRestriction(models.Model):
    """Régimes alimentaires"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Allergy(models.Model):
    """Allergies et intolérances"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Profil utilisateur avec préférences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    dietary_restrictions = models.ManyToManyField(DietaryRestriction, blank=True)
    allergies = models.ManyToManyField(Allergy, blank=True)
    food_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil de {self.user.username}"


class RecipeCategory(models.Model):
    """Catégories de recettes"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class IngredientCategory(models.Model):
    """Catégories d'ingrédients"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Recipe(models.Model):
    """Modèle de recette"""
    DIFFICULTY_CHOICES = [
        (1, 'Très facile'),
        (2, 'Facile'),
        (3, 'Moyen'),
        (4, 'Difficile'),
        (5, 'Très difficile'),
    ]

    COST_CHOICES = [
        (1, 'FCFA - Économique'),
        (2, 'FCFA - Modéré'),
        (3, 'FCFA - Coûteux'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(RecipeCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Métadonnées
    prep_time = models.IntegerField(help_text="Temps de préparation en minutes")
    cook_time = models.IntegerField(help_text="Temps de cuisson en minutes")
    servings = models.IntegerField(validators=[MinValueValidator(1)])
    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES, default=2)
    estimated_cost = models.IntegerField(choices=COST_CHOICES, default=2)
    
    # Contenu
    instructions = models.TextField(help_text="Étapes de préparation (format texte enrichi)")
    tags = models.JSONField(default=list, blank=True)
    
    # Images
    main_image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    
    # Statistiques
    views_count = models.IntegerField(default=0)
    favorites_count = models.IntegerField(default=0)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def total_time(self):
        return self.prep_time + self.cook_time


class RecipeImage(models.Model):
    """Images supplémentaires pour les recettes"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='recipes/images/')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']


class Ingredient(models.Model):
    """Ingrédient d'une recette"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True)
    category = models.ForeignKey(IngredientCategory, on_delete=models.SET_NULL, null=True, blank=True)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.name} - {self.quantity} {self.unit}"


class FavoriteRecipe(models.Model):
    """Recettes favorites des utilisateurs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'recipe']

    def __str__(self):
        return f"{self.user.username} - {self.recipe.title}"


class RecipeView(models.Model):
    """Historique de consultation des recettes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipe_views', null=True, blank=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-viewed_at']


class ShoppingList(models.Model):
    """Liste de courses"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shopping_lists')
    name = models.CharField(max_length=200, default="Ma liste de courses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class ShoppingListItem(models.Model):
    """Élément d'une liste de courses"""
    shopping_list = models.ForeignKey(ShoppingList, on_delete=models.CASCADE, related_name='items')
    ingredient_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True)
    category = models.ForeignKey(IngredientCategory, on_delete=models.SET_NULL, null=True, blank=True)
    is_checked = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'ingredient_name']

    def __str__(self):
        return f"{self.ingredient_name} - {self.quantity} {self.unit}"


class Menu(models.Model):
    """Menu sur plusieurs jours"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='menus')
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class MenuRecipe(models.Model):
    """Recette dans un menu"""
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    date = models.DateField()
    meal_type = models.CharField(
        max_length=20,
        choices=[
            ('breakfast', 'Petit-déjeuner'),
            ('lunch', 'Déjeuner'),
            ('dinner', 'Dîner'),
            ('snack', 'Collation'),
        ],
        default='dinner'
    )

    class Meta:
        unique_together = ['menu', 'recipe', 'date', 'meal_type']

    def __str__(self):
        return f"{self.menu.name} - {self.recipe.title} - {self.date}"


