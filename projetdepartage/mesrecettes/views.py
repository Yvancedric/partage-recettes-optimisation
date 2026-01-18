from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    User, UserProfile, Recipe, RecipeImage, Ingredient,
    RecipeCategory, IngredientCategory, DietaryRestriction,
    Allergy, FavoriteRecipe, RecipeView, ShoppingList,
    ShoppingListItem, Menu, MenuRecipe
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserProfileSerializer,
    RecipeSerializer, RecipeCreateUpdateSerializer, IngredientSerializer,
    RecipeCategorySerializer, IngredientCategorySerializer,
    DietaryRestrictionSerializer, AllergySerializer, FavoriteRecipeSerializer,
    ShoppingListSerializer, ShoppingListCreateUpdateSerializer, ShoppingListItemSerializer, MenuSerializer, MenuRecipeSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_me(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class RecipeCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RecipeCategory.objects.all()
    serializer_class = RecipeCategorySerializer
    permission_classes = [AllowAny]


class IngredientCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IngredientCategory.objects.all()
    serializer_class = IngredientCategorySerializer
    permission_classes = [AllowAny]


class DietaryRestrictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DietaryRestriction.objects.all()
    serializer_class = DietaryRestrictionSerializer
    permission_classes = [AllowAny]


class AllergyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer
    permission_classes = [AllowAny]


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags', 'ingredients__name']
    ordering_fields = ['created_at', 'views_count', 'favorites_count', 'total_time']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RecipeCreateUpdateSerializer
        return RecipeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        # Si l'utilisateur n'est pas authentifié, ne montrer que les recettes publiées
        if not self.request.user.is_authenticated:
            queryset = Recipe.objects.filter(is_published=True)
        # Si l'utilisateur est authentifié, montrer toutes les recettes publiées
        # et les recettes non publiées de l'utilisateur
        else:
            queryset = Recipe.objects.filter(
                Q(is_published=True) | Q(author=self.request.user)
            )
        
        # Précharger les relations pour optimiser les performances
        queryset = queryset.select_related('author', 'category').prefetch_related(
            'ingredients', 'images', 'ingredients__category'
        )
        
        # Filtres
        category = self.request.query_params.get('category', None)
        difficulty = self.request.query_params.get('difficulty', None)
        max_time = self.request.query_params.get('max_time', None)
        min_servings = self.request.query_params.get('min_servings', None)
        tags = self.request.query_params.getlist('tags', None)
        ingredient = self.request.query_params.get('ingredient', None)

        if category:
            queryset = queryset.filter(category_id=category)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if max_time:
            queryset = queryset.filter(
                prep_time__lte=max_time,
                cook_time__lte=max_time
            )
        if min_servings:
            queryset = queryset.filter(servings__gte=min_servings)
        if tags:
            for tag in tags:
                queryset = queryset.filter(tags__icontains=tag)
        if ingredient:
            queryset = queryset.filter(ingredients__name__icontains=ingredient)

        return queryset.distinct()

    def get_object(self):
        """
        Override get_object pour récupérer la recette directement
        et vérifier les permissions d'accès
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        try:
            recipe = Recipe.objects.select_related('author', 'category').prefetch_related(
                'ingredients', 'images', 'ingredients__category'
            ).get(pk=lookup_value)
        except Recipe.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('No Recipe matches the given query.')
        
        # Vérifier les permissions d'accès
        # Si l'utilisateur n'est pas authentifié, ne montrer que les recettes publiées
        if not self.request.user.is_authenticated:
            if not recipe.is_published:
                from rest_framework.exceptions import NotFound
                raise NotFound('No Recipe matches the given query.')
        # Si l'utilisateur est authentifié, montrer les recettes publiées ou les recettes de l'utilisateur
        else:
            if not recipe.is_published and recipe.author != self.request.user:
                from rest_framework.exceptions import NotFound
                raise NotFound('No Recipe matches the given query.')
        
        return recipe

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Enregistrer la vue
        RecipeView.objects.create(
            recipe=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        instance.views_count += 1
        instance.save(update_fields=['views_count'])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        favorite, created = FavoriteRecipe.objects.get_or_create(
            user=request.user,
            recipe=recipe
        )
        
        if request.method == 'DELETE':
            favorite.delete()
            recipe.favorites_count = max(0, recipe.favorites_count - 1)
            recipe.save(update_fields=['favorites_count'])
            return Response({'status': 'removed'})
        
        if not created:
            return Response({'status': 'already_favorited'}, status=status.HTTP_400_BAD_REQUEST)
        
        recipe.favorites_count += 1
        recipe.save(update_fields=['favorites_count'])
        return Response({'status': 'added'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_recipes(self, request):
        recipes = Recipe.objects.filter(author=request.user)
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        favorites = FavoriteRecipe.objects.filter(user=request.user)
        recipes = [f.recipe for f in favorites]
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def history(self, request):
        views = RecipeView.objects.filter(user=request.user).order_by('-viewed_at')[:50]
        recipes = [v.recipe for v in views]
        serializer = self.get_serializer(recipes, many=True)
        return Response(serializer.data)


class ShoppingListViewSet(viewsets.ModelViewSet):
    queryset = ShoppingList.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ShoppingListCreateUpdateSerializer
        return ShoppingListSerializer

    def get_queryset(self):
        return ShoppingList.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_item(self, request, pk=None):
        shopping_list = self.get_object()
        serializer = ShoppingListItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(shopping_list=shopping_list)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def from_recipe(self, request, pk=None):
        shopping_list = self.get_object()
        recipe_id = request.data.get('recipe_id')
        
        try:
            recipe = Recipe.objects.get(id=recipe_id)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recette non trouvée'}, status=status.HTTP_404_NOT_FOUND)

        # Ajouter les ingrédients de la recette
        for ingredient in recipe.ingredients.all():
            ShoppingListItem.objects.create(
                shopping_list=shopping_list,
                ingredient_name=ingredient.name,
                quantity=ingredient.quantity,
                unit=ingredient.unit,
                category=ingredient.category
            )

        serializer = self.get_serializer(shopping_list)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def from_menu(self, request, pk=None):
        shopping_list = self.get_object()
        menu_id = request.data.get('menu_id')
        
        try:
            menu = Menu.objects.get(id=menu_id, user=request.user)
        except Menu.DoesNotExist:
            return Response({'error': 'Menu non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Agréger les ingrédients de toutes les recettes du menu
        ingredients_dict = {}
        for menu_recipe in menu.recipes.all():
            for ingredient in menu_recipe.recipe.ingredients.all():
                key = f"{ingredient.name}_{ingredient.unit}"
                if key in ingredients_dict:
                    ingredients_dict[key]['quantity'] += ingredient.quantity
                else:
                    ingredients_dict[key] = {
                        'name': ingredient.name,
                        'quantity': ingredient.quantity,
                        'unit': ingredient.unit,
                        'category': ingredient.category
                    }

        # Créer les items de la liste
        for item_data in ingredients_dict.values():
            ShoppingListItem.objects.create(
                shopping_list=shopping_list,
                ingredient_name=item_data['name'],
                quantity=item_data['quantity'],
                unit=item_data['unit'],
                category=item_data['category']
            )

        serializer = self.get_serializer(shopping_list)
        return Response(serializer.data)


class ShoppingListItemViewSet(viewsets.ModelViewSet):
    queryset = ShoppingListItem.objects.all()
    serializer_class = ShoppingListItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShoppingListItem.objects.filter(shopping_list__user=self.request.user)


class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Menu.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_recipe(self, request, pk=None):
        menu = self.get_object()
        serializer = MenuRecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(menu=menu)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StatisticsView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        stats = {
            'total_recipes': Recipe.objects.filter(author=user).count(),
            'total_favorites': FavoriteRecipe.objects.filter(user=user).count(),
            'total_views': RecipeView.objects.filter(user=user).count(),
            'most_viewed_recipes': Recipe.objects.filter(
                author=user
            ).order_by('-views_count')[:5].values('id', 'title', 'views_count'),
            'recent_recipes': Recipe.objects.filter(
                author=user
            ).order_by('-created_at')[:5].values('id', 'title', 'created_at'),
        }
        return Response(stats)


def social_auth_callback(request):
    """
    Vue de callback pour l'authentification sociale (Google, Facebook).
    Cette vue est appelée après l'authentification réussie via social_django.
    Génère les tokens JWT et redirige vers le frontend.
    """
    if request.user.is_authenticated:
        try:
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(request.user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Créer le profil utilisateur s'il n'existe pas
            UserProfile.objects.get_or_create(user=request.user)
            
            # Rediriger vers le frontend avec les tokens dans l'URL
            frontend_url = 'http://localhost:5173/auth/callback'
            redirect_url = f"{frontend_url}?access={access_token}&refresh={refresh_token}"
            return redirect(redirect_url)
        except Exception as e:
            # En cas d'erreur, rediriger vers la page de connexion avec un message d'erreur
            return redirect('http://localhost:5173/login?error=social_auth_failed')
    else:
        # Si l'authentification a échoué, rediriger vers la page de connexion
        return redirect('http://localhost:5173/login?error=social_auth_failed')
