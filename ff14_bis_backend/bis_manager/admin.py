from django.contrib import admin
from .models import (
    Season, Item, Player, BisSet, BisItem, Materia,
    RaidProgress, ItemAcquisition, DistributionPriority, ResourceTracking,
    CustomUser, Schedule
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'nickname', 'user_type', 'is_staff', 'is_active')
    list_filter = ('user_type', 'is_staff', 'is_active')
    search_fields = ['username', 'email', 'nickname']

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_active', 'distribution_method')
    list_filter = ('is_active', 'distribution_method')
    search_fields = ['name']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'source', 'item_level', 'season')
    list_filter = ('type', 'source', 'item_level', 'season')
    seaerch_fields = ['name']

@admin.register(Player)
class PalyerAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'job', 'job_type', 'linked_user')
    list_filter = ('job', 'job_type')
    search_fields = ['nickname']
    
    def linked_user(self, obj):
        """연결된 사용자 표시"""
        return obj.user.username if obj.user else '-'
    
    linked_user.short_description = '연결된 사용자'

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_time', 'end_time', 'creator', 'is_admin_schedule', 'repeat_type')
    list_filter = ('is_admin_schedule', 'repeat_type', 'creator')
    search_fields = ['title', 'description']

class MateriaInline(admin.TabularInline):
    model = Materia
    extra = 0

@admin.register(BisItem)
class BisItemAdmin(admin.ModelAdmin):
    list_display = ('bis_set', 'slot', 'item')
    list_filter = ('slot', 'bis_set__bis_type', 'bis_set__player', 'bis_set__season')
    inlines = [MateriaInline]

class BisItemInline(admin.TabularInline):
    model = BisItem
    extra = 0

@admin.register(BisSet)
class BisSetAdmin(admin.ModelAdmin):
    list_display = ('player', 'season', 'bis_type')
    list_filter = ('bis_type', 'season')
    search_fields = ['player__nickname']
    inlines = [BisItemInline]

class ItemAcquisitionInline(admin.TabularInline):
    model = ItemAcquisition
    extra = 0

@admin.register(RaidProgress)
class RaidProgressAdmin(admin.ModelAdmin):
    list_display = ('season', 'raid_date', 'floor', 'notes')
    list_filter = ('season', 'floor')
    date_hierarchy = 'raid_date'
    inlines = [ItemAcquisitionInline]

@admin.register(ItemAcquisition)
class ItemAcquisitionAdmin(admin.ModelAdmin):
    list_display = ('raid_progress', 'player', 'item')
    list_filter = ('raid_progress__season', 'raid_progress__floor', 'player')
    search_fields = ['player__nickname', 'item__name']

@admin.register(DistributionPriority)
class DistributionPriorityAdmin(admin.ModelAdmin):
    list_display = ('season', 'player', 'item_type', 'priority')
    list_filter = ('season', 'item_type')
    search_fields = ['player__nickname']

@admin.register(ResourceTracking)
class ResourceTrackingAdmin(admin.ModelAdmin):
    list_display = ('player', 'season', 'resource_type', 'current_amount', 'total_needed')
    list_filter = ('season', 'resource_type')
    search_fields = ['player__nickname']