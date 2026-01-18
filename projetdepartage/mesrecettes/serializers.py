from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, UserProfile, Recipe, RecipeImage, Ingredient,
    RecipeCategory, IngredientCategory, DietaryRestriction,
    Allergy, FavoriteRecipe, RecipeView, ShoppingList,
    ShoppingListItem, Menu, MenuRecipe
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'profile_picture', 'bio', 'culinary_level', 'is_email_verified']
        read_only_fields = ['is_email_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class DietaryRestrictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietaryRestriction
        fields = ['id', 'name', 'description']


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'name', 'description']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    dietary_restrictions = DietaryRestrictionSerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    dietary_restriction_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=DietaryRestriction.objects.all(), write_only=True, required=False
    )
    allergy_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Allergy.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'dietary_restrictions', 'allergies', 'food_preferences',
                  'dietary_restriction_ids', 'allergy_ids', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        dietary_restriction_ids = validated_data.pop('dietary_restriction_ids', None)
        allergy_ids = validated_data.pop('allergy_ids', None)

        if dietary_restriction_ids is not None:
            instance.dietary_restrictions.set(dietary_restriction_ids)
        if allergy_ids is not None:
            instance.allergies.set(allergy_ids)

        return super().update(instance, validated_data)


class IngredientCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientCategory
        fields = ['id', 'name', 'description']


class IngredientSerializer(serializers.ModelSerializer):
    category = IngredientCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=IngredientCategory.objects.all(), write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'quantity', 'unit', 'category', 'category_id',
                  'estimated_price', 'order']

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category'] = category_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id is not None:
            instance.category = category_id
        return super().update(instance, validated_data)


class RecipeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImage
        fields = ['id', 'image', 'order']


class RecipeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeCategory
        fields = ['id', 'name', 'description', 'icon', 'image']


class RecipeSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = RecipeCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=RecipeCategory.objects.all(), write_only=True, required=False, allow_null=True
    )
    ingredients = IngredientSerializer(many=True, read_only=True)
    images = RecipeImageSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    total_time = serializers.ReadOnlyField()
    
    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'author', 'category', 'category_id',
                  'prep_time', 'cook_time', 'total_time', 'servings', 'difficulty',
                  'estimated_cost', 'instructions', 'tags', 'main_image', 'images',
                  'ingredients', 'views_count', 'favorites_count', 'is_favorited',
                  'is_published', 'created_at', 'updated_at', 'published_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FavoriteRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False
    
    def to_representation(self, instance):
        # S'assurer que les ingrédients sont chargés
        # Précharger les ingrédients pour éviter les requêtes N+1
        if not hasattr(instance, '_prefetched_objects_cache') or 'ingredients' not in getattr(instance._prefetched_objects_cache, 'ingredients', {}):
            instance = Recipe.objects.prefetch_related('ingredients', 'ingredients__category').get(pk=instance.pk)
        representation = super().to_representation(instance)
        # Vérifier que les ingrédients sont bien présents
        if 'ingredients' not in representation or representation['ingredients'] is None:
            representation['ingredients'] = []
        return representation


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    ingredients = IngredientSerializer(many=True, required=False)
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Recipe
        fields = ['title', 'description', 'category_id', 'prep_time', 'cook_time',
                  'servings', 'difficulty', 'estimated_cost', 'instructions', 'tags',
                  'main_image', 'ingredients', 'images', 'is_published']

    def to_internal_value(self, data):
        # Parser les données JSON stringifiées depuis FormData
        import json
        from django.http import QueryDict
        
        # Convertir QueryDict en dict mutable si nécessaire
        if isinstance(data, QueryDict):
            data = data.copy()
        
        # Parser les ingrédients
        ingredients_value = data.get('ingredients')
        if ingredients_value:
            if isinstance(ingredients_value, str):
                try:
                    parsed_ingredients = json.loads(ingredients_value)
                    # S'assurer que c'est une liste
                    if isinstance(parsed_ingredients, list):
                        data['ingredients'] = parsed_ingredients
                    else:
                        data['ingredients'] = []
                except (json.JSONDecodeError, TypeError) as e:
                    # Si le parsing échoue, essayer de récupérer depuis request
                    request = self.context.get('request')
                    if request:
                        # Essayer request.data (pour les tests) ou request.POST
                        if hasattr(request, 'data') and 'ingredients' in request.data:
                            ingredients_value = request.data.get('ingredients')
                            if isinstance(ingredients_value, str):
                                try:
                                    data['ingredients'] = json.loads(ingredients_value)
                                except (json.JSONDecodeError, TypeError):
                                    data['ingredients'] = []
                        elif hasattr(request, 'POST') and 'ingredients' in request.POST:
                            ingredients_value = request.POST.get('ingredients')
                            if isinstance(ingredients_value, str):
                                try:
                                    data['ingredients'] = json.loads(ingredients_value)
                                except (json.JSONDecodeError, TypeError):
                                    data['ingredients'] = []
                        else:
                            data['ingredients'] = []
                    else:
                        data['ingredients'] = []
            elif isinstance(ingredients_value, list):
                # Déjà une liste, pas besoin de parser
                data['ingredients'] = ingredients_value
            else:
                data['ingredients'] = []
        else:
            data['ingredients'] = []
        
        # Parser les tags
        tags_value = data.get('tags')
        if tags_value:
            if isinstance(tags_value, str):
                try:
                    parsed_tags = json.loads(tags_value)
                    if isinstance(parsed_tags, list):
                        data['tags'] = parsed_tags
                    else:
                        data['tags'] = []
                except (json.JSONDecodeError, TypeError):
                    data['tags'] = []
            elif isinstance(tags_value, list):
                data['tags'] = tags_value
            else:
                data['tags'] = []
        else:
            data['tags'] = []
        
        return super().to_internal_value(data)

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients', [])
        images_data = validated_data.pop('images', [])
        category_id = validated_data.pop('category_id', None)

        if category_id:
            validated_data['category'] = category_id

        # Récupérer l'utilisateur depuis le contexte de la requête
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['author'] = request.user
        else:
            raise serializers.ValidationError("L'utilisateur doit être authentifié pour créer une recette.")

        # S'assurer que is_published est défini (par défaut True)
        if 'is_published' not in validated_data:
            validated_data['is_published'] = True
        
        # Si la recette est publiée, définir published_at
        if validated_data.get('is_published') and 'published_at' not in validated_data:
            from django.utils import timezone
            validated_data['published_at'] = timezone.now()

        recipe = Recipe.objects.create(**validated_data)

        # Créer les ingrédients avec validation
        if ingredients_data:
            for idx, ingredient_data in enumerate(ingredients_data):
                # Nettoyer et valider le nom
                ingredient_name = ingredient_data.get('name', '').strip()
                ingredient_quantity = ingredient_data.get('quantity')
                
                # S'assurer que les champs requis sont présents
                if not ingredient_name or ingredient_quantity is None or str(ingredient_quantity).strip() == '':
                    continue
                
                # Convertir quantity en Decimal si c'est une string
                quantity = ingredient_quantity
                try:
                    from decimal import Decimal
                    if isinstance(quantity, str):
                        quantity = quantity.strip()
                        if not quantity:
                            continue
                    quantity = Decimal(str(quantity))
                except (ValueError, TypeError, Exception):
                    continue
                
                # Préparer les données de l'ingrédient
                ingredient_kwargs = {
                    'recipe': recipe,
                    'name': ingredient_name,
                    'quantity': quantity,
                    'unit': ingredient_data.get('unit', '').strip(),
                    'order': ingredient_data.get('order', idx),
                }
                
                # Gérer category_id si présent
                category_id_ing = ingredient_data.get('category_id')
                if category_id_ing:
                    ingredient_kwargs['category_id'] = category_id_ing
                
                # Gérer estimated_price si présent
                estimated_price = ingredient_data.get('estimated_price', 0)
                if estimated_price:
                    if isinstance(estimated_price, str):
                        try:
                            from decimal import Decimal
                            ingredient_kwargs['estimated_price'] = Decimal(str(estimated_price))
                        except (ValueError, TypeError):
                            ingredient_kwargs['estimated_price'] = 0
                    else:
                        from decimal import Decimal
                        ingredient_kwargs['estimated_price'] = Decimal(str(estimated_price))
                else:
                    ingredient_kwargs['estimated_price'] = 0
                
                try:
                    Ingredient.objects.create(**ingredient_kwargs)
                except Exception as e:
                    # Logger l'erreur mais continuer avec les autres ingrédients
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Erreur lors de la création de l'ingrédient: {e}, données: {ingredient_data}")
                    continue

        for idx, image in enumerate(images_data[:5]):  # Max 5 images
            RecipeImage.objects.create(recipe=recipe, image=image, order=idx)

        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        images_data = validated_data.pop('images', None)
        category_id = validated_data.pop('category_id', None)

        if category_id is not None:
            instance.category = category_id

        # Vérifier que l'utilisateur est le propriétaire de la recette
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if instance.author != request.user:
                raise serializers.ValidationError("Vous n'êtes pas autorisé à modifier cette recette.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Mettre à jour les ingrédients avec la même validation que dans create
        if ingredients_data is not None:
            # Si ingredients_data est une liste vide, supprimer tous les ingrédients
            # Si c'est une liste avec des éléments, remplacer les ingrédients
            instance.ingredients.all().delete()
            if isinstance(ingredients_data, list) and len(ingredients_data) > 0:
                for idx, ingredient_data in enumerate(ingredients_data):
                    # Nettoyer et valider le nom
                    ingredient_name = ingredient_data.get('name', '').strip()
                    ingredient_quantity = ingredient_data.get('quantity')
                    
                    # S'assurer que les champs requis sont présents
                    if not ingredient_name or ingredient_quantity is None or str(ingredient_quantity).strip() == '':
                        continue
                    
                    # Convertir quantity en Decimal si c'est une string
                    quantity = ingredient_quantity
                    try:
                        from decimal import Decimal
                        if isinstance(quantity, str):
                            quantity = quantity.strip()
                            if not quantity:
                                continue
                        quantity = Decimal(str(quantity))
                    except (ValueError, TypeError, Exception):
                        continue
                    
                    # Préparer les données de l'ingrédient
                    ingredient_kwargs = {
                        'recipe': instance,
                        'name': ingredient_name,
                        'quantity': quantity,
                        'unit': ingredient_data.get('unit', '').strip(),
                        'order': ingredient_data.get('order', idx),
                    }
                    
                    # Gérer category_id si présent
                    category_id_ing = ingredient_data.get('category_id')
                    if category_id_ing:
                        ingredient_kwargs['category_id'] = category_id_ing
                    
                    # Gérer estimated_price si présent
                    estimated_price = ingredient_data.get('estimated_price', 0)
                    if estimated_price:
                        if isinstance(estimated_price, str):
                            try:
                                from decimal import Decimal
                                ingredient_kwargs['estimated_price'] = Decimal(str(estimated_price))
                            except (ValueError, TypeError):
                                ingredient_kwargs['estimated_price'] = 0
                        else:
                            from decimal import Decimal
                            ingredient_kwargs['estimated_price'] = Decimal(str(estimated_price))
                    else:
                        ingredient_kwargs['estimated_price'] = 0
                    
                    try:
                        Ingredient.objects.create(**ingredient_kwargs)
                    except Exception as e:
                        # Logger l'erreur mais continuer avec les autres ingrédients
                        import logging
                        logger = logging.getLogger(__name__)
                        logger.error(f"Erreur lors de la mise à jour de l'ingrédient: {e}, données: {ingredient_data}")
                        continue

        if images_data is not None:
            instance.images.all().delete()
            for idx, image in enumerate(images_data[:5]):
                RecipeImage.objects.create(recipe=instance, image=image, order=idx)

        return instance


class FavoriteRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    
    class Meta:
        model = FavoriteRecipe
        fields = ['id', 'recipe', 'created_at']


class ShoppingListItemSerializer(serializers.ModelSerializer):
    category = IngredientCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=IngredientCategory.objects.all(), write_only=True, required=False, allow_null=True
    )
    
    class Meta:
        model = ShoppingListItem
        fields = ['id', 'ingredient_name', 'quantity', 'unit', 'category', 'category_id',
                  'is_checked', 'order']

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category'] = category_id
        return super().create(validated_data)


class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = ShoppingList
        fields = ['id', 'name', 'items', 'created_at', 'updated_at']


class ShoppingListCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingList
        fields = ['name']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user'] = request.user
        else:
            raise serializers.ValidationError("L'utilisateur doit être authentifié pour créer une liste de courses.")
        
        return super().create(validated_data)


class MenuRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(), write_only=True
    )
    
    class Meta:
        model = MenuRecipe
        fields = ['id', 'recipe', 'recipe_id', 'date', 'meal_type']

    def create(self, validated_data):
        recipe_id = validated_data.pop('recipe_id')
        validated_data['recipe'] = recipe_id
        return super().create(validated_data)


class MenuSerializer(serializers.ModelSerializer):
    recipes = MenuRecipeSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'name', 'start_date', 'end_date', 'recipes', 'created_at', 'updated_at']


