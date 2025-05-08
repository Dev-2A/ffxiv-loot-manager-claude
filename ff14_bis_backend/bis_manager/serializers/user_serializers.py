from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'profile_image', 'profile_image_url']
    
    def get_profile_image_url(self, obj):
        """프로필 이미지 URL 반환"""
        if obj.profile_image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return obj.profile_image_url

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'user_type']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password":"비밀번호가 일치하지 않습니다."})
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            user_type=validated_data['user_type']
        )
        user.set_password(validated_data['password'])
        
        # 랜덤 프로필 이미지 할당
        user.assign_random_profile_image()
        
        user.save()
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['emamil', 'profile_image', 'profile_image_url']
    
    def update(self, instance, validated_data):
        # 이메일 업데이트
        if 'email' in validated_data:
            instance.email = validated_data['email']
        
        # 프로필 이미지 업데이트 (파일 업로드)
        if 'profile_image' in validated_data:
            # 이미지가 있으면 기존 URL은 제거
            instance.profile_image = validated_data['profile_image']
            instance.profile_image_url = None
        
        # 프로필 이미지 URL 업데이트
        if 'profile_image_url' in validated_data:
            # URL이 있으면 기존 이미지는 제거
            instance.profile_image_url = validated_data['profile_image_url']
            instance.profile_image = None
        
        instance.save()
        return instance