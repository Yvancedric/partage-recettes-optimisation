from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, UserProfile, Recipe, RecipeImage, Ingredient,
    RecipeCategory, IngredientCategory, DietaryRestriction,
    Allergy, FavoriteRecipe, RecipeView, ShoppingList,
    ShoppingListItem, Menu, MenuRecipe
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_email_verified', 
                    'culinary_level', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_email_verified', 'culinary_level', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations supplémentaires', {
            'fields': ('profile_picture', 'bio', 'culinary_level', 'is_email_verified', 'email_verification_token')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_dietary_restrictions_count', 'get_allergies_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    filter_horizontal = ['dietary_restrictions', 'allergies']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Préférences alimentaires', {
            'fields': ('dietary_restrictions', 'allergies', 'food_preferences')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_dietary_restrictions_count(self, obj):
        return obj.dietary_restrictions.count()
    get_dietary_restrictions_count.short_description = 'Régimes alimentaires'
    
    def get_allergies_count(self, obj):
        return obj.allergies.count()
    get_allergies_count.short_description = 'Allergies'


@admin.register(RecipeCategory)
class RecipeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'get_image_preview', 'get_recipes_count', 'description']
    search_fields = ['name', 'description']
    list_filter = ['name']
    readonly_fields = ['get_image_preview']
    
    fieldsets = (
        ('Informations', {
            'fields': ('name', 'description', 'icon', 'image', 'get_image_preview')
        }),
    )
    
    def get_image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 100px; max-height: 100px;" />', obj.image.url)
        return "Aucune image"
    get_image_preview.short_description = 'Aperçu'
    
    def get_recipes_count(self, obj):
        return obj.recipe_set.count()
    get_recipes_count.short_description = 'Nombre de recettes'


@admin.register(IngredientCategory)
class IngredientCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_ingredients_count', 'description']
    search_fields = ['name', 'description']
    
    def get_ingredients_count(self, obj):
        return obj.ingredient_set.count()
    get_ingredients_count.short_description = 'Nombre d\'ingrédients'


@admin.register(DietaryRestriction)
class DietaryRestrictionAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_users_count', 'description']
    search_fields = ['name', 'description']
    
    def get_users_count(self, obj):
        return obj.userprofile_set.count()
    get_users_count.short_description = 'Utilisateurs'


@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_users_count', 'description']
    search_fields = ['name', 'description']
    
    def get_users_count(self, obj):
        return obj.userprofile_set.count()
    get_users_count.short_description = 'Utilisateurs'


class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1
    fields = ['image', 'order']


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1
    fields = ['name', 'quantity', 'unit', 'category', 'estimated_price', 'order']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'difficulty', 'servings', 'total_time_display', 
                    'estimated_cost', 'is_published', 'views_count', 'favorites_count', 'created_at']
    list_filter = ['category', 'difficulty', 'estimated_cost', 'is_published', 'created_at', 'updated_at']
    search_fields = ['title', 'description', 'author__username', 'author__email', 'tags']
    readonly_fields = ['views_count', 'favorites_count', 'created_at', 'updated_at', 'published_at']
    date_hierarchy = 'created_at'
    inlines = [RecipeImageInline, IngredientInline]
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'author', 'category', 'main_image', 'tags')
        }),
        ('Métadonnées', {
            'fields': ('prep_time', 'cook_time', 'servings', 'difficulty', 'estimated_cost')
        }),
        ('Instructions', {
            'fields': ('instructions',)
        }),
        ('Statistiques', {
            'fields': ('views_count', 'favorites_count')
        }),
        ('Publication', {
            'fields': ('is_published', 'published_at')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def total_time_display(self, obj):
        return f"{obj.total_time} min"
    total_time_display.short_description = 'Temps total'
    
    def save_model(self, request, obj, form, change):
        if not change and obj.is_published:
            from django.utils import timezone
            obj.published_at = timezone.now()
        super().save_model(request, obj, form, change)


@admin.register(RecipeImage)
class RecipeImageAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'image_preview', 'order', 'created_at']
    list_filter = ['recipe', 'created_at']
    search_fields = ['recipe__title']
    ordering = ['recipe', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" height="100" style="object-fit: cover;" />', obj.image.url)
        return "Pas d'image"
    image_preview.short_description = 'Aperçu'


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ['name', 'recipe', 'quantity', 'unit', 'category', 'estimated_price', 'order']
    list_filter = ['category', 'recipe', 'recipe__author']
    search_fields = ['name', 'recipe__title']
    ordering = ['recipe', 'order']
    
    fieldsets = (
        ('Informations', {
            'fields': ('recipe', 'name', 'category')
        }),
        ('Quantité et prix', {
            'fields': ('quantity', 'unit', 'estimated_price', 'order')
        }),
    )


@admin.register(FavoriteRecipe)
class FavoriteRecipeAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipe', 'created_at']
    list_filter = ['created_at', 'recipe__category']
    search_fields = ['user__username', 'recipe__title']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']


@admin.register(RecipeView)
class RecipeViewAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'ip_address', 'viewed_at']
    list_filter = ['viewed_at', 'recipe__category']
    search_fields = ['recipe__title', 'user__username', 'ip_address']
    date_hierarchy = 'viewed_at'
    readonly_fields = ['viewed_at']


class ShoppingListItemInline(admin.TabularInline):
    model = ShoppingListItem
    extra = 1
    fields = ['ingredient_name', 'quantity', 'unit', 'category', 'is_checked', 'order']


@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'get_items_count', 'get_checked_items_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'user__username', 'user__email']
    date_hierarchy = 'created_at'
    inlines = [ShoppingListItemInline]
    readonly_fields = ['created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
    get_items_count.short_description = 'Total items'
    
    def get_checked_items_count(self, obj):
        return obj.items.filter(is_checked=True).count()
    get_checked_items_count.short_description = 'Items cochés'


@admin.register(ShoppingListItem)
class ShoppingListItemAdmin(admin.ModelAdmin):
    list_display = ['ingredient_name', 'shopping_list', 'quantity', 'unit', 'category', 'is_checked', 'order']
    list_filter = ['is_checked', 'category', 'shopping_list']
    search_fields = ['ingredient_name', 'shopping_list__name', 'shopping_list__user__username']
    ordering = ['shopping_list', 'order', 'ingredient_name']


class MenuRecipeInline(admin.TabularInline):
    model = MenuRecipe
    extra = 1
    fields = ['recipe', 'date', 'meal_type']


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'start_date', 'end_date', 'get_recipes_count', 'created_at', 'updated_at']
    list_filter = ['start_date', 'end_date', 'created_at']
    search_fields = ['name', 'user__username', 'user__email']
    date_hierarchy = 'start_date'
    inlines = [MenuRecipeInline]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations', {
            'fields': ('name', 'user')
        }),
        ('Période', {
            'fields': ('start_date', 'end_date')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_recipes_count(self, obj):
        return obj.recipes.count()
    get_recipes_count.short_description = 'Nombre de recettes'


@admin.register(MenuRecipe)
class MenuRecipeAdmin(admin.ModelAdmin):
    list_display = ['menu', 'recipe', 'date', 'meal_type']
    list_filter = ['meal_type', 'date', 'menu']
    search_fields = ['menu__name', 'recipe__title', 'menu__user__username']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Informations', {
            'fields': ('menu', 'recipe')
        }),
        ('Planification', {
            'fields': ('date', 'meal_type')
        }),
    )


