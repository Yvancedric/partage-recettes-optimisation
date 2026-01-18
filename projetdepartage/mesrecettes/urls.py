from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django_rest_passwordreset.views import (
    ResetPasswordRequestToken,
    ResetPasswordConfirm,
    ResetPasswordValidateToken
)
from .views import (
    UserViewSet, UserRegistrationView, UserProfileViewSet,
    RecipeViewSet, RecipeCategoryViewSet, IngredientCategoryViewSet,
    DietaryRestrictionViewSet, AllergyViewSet, ShoppingListViewSet,
    ShoppingListItemViewSet, MenuViewSet, StatisticsView, social_auth_callback
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'recipes', RecipeViewSet, basename='recipe')
router.register(r'recipe-categories', RecipeCategoryViewSet, basename='recipe-category')
router.register(r'ingredient-categories', IngredientCategoryViewSet, basename='ingredient-category')
router.register(r'dietary-restrictions', DietaryRestrictionViewSet, basename='dietary-restriction')
router.register(r'allergies', AllergyViewSet, basename='allergy')
router.register(r'shopping-lists', ShoppingListViewSet, basename='shopping-list')
router.register(r'shopping-list-items', ShoppingListItemViewSet, basename='shopping-list-item')
router.register(r'menus', MenuViewSet, basename='menu')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password-reset/', ResetPasswordRequestToken.as_view(), name='password-reset'),
    path('auth/password-reset/confirm/', ResetPasswordConfirm.as_view(), name='password-reset-confirm'),
    path('auth/password-reset/validate_token/', ResetPasswordValidateToken.as_view(), name='password-reset-validate-token'),
    path('auth/social/callback/', social_auth_callback, name='social-auth-callback'),
    path('statistics/', StatisticsView.as_view(), name='statistics'),
]

