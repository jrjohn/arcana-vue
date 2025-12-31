import { ref, computed, type App, type Plugin } from 'vue'

/**
 * Supported languages
 */
export type Language = 'en' | 'zh' | 'zh-TW' | 'es' | 'fr' | 'de'

/**
 * Language display info
 */
export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
}

/**
 * Available languages
 */
export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
]

const STORAGE_KEY = 'arcana_language'

/**
 * Translation dictionaries
 */
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.actions': 'Actions',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.noData': 'No data available',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',

    // Navigation
    'nav.home': 'Home',
    'nav.users': 'Users',
    'nav.calendar': 'Calendar',
    'nav.messages': 'Messages',
    'nav.projects': 'Projects',
    'nav.tasks': 'Tasks',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // User module
    'user.list.title': 'User Management',
    'user.list.subtitle': 'Manage all users in the system',
    'user.list.searchPlaceholder': 'Search users...',
    'user.list.addNew': 'Add New User',
    'user.list.noUsers': 'No users found',
    'user.list.loadMore': 'Load More',
    'user.list.showing': 'Showing {start} to {end} of {total} users',

    'user.detail.title': 'User Details',
    'user.detail.back': 'Back to Users',
    'user.detail.email': 'Email',
    'user.detail.firstName': 'First Name',
    'user.detail.lastName': 'Last Name',
    'user.detail.editUser': 'Edit User',
    'user.detail.deleteUser': 'Delete User',

    'user.form.createTitle': 'Create New User',
    'user.form.editTitle': 'Edit User',
    'user.form.name': 'Name',
    'user.form.namePlaceholder': 'Enter user name',
    'user.form.job': 'Job Title',
    'user.form.jobPlaceholder': 'Enter job title',
    'user.form.nameRequired': 'Name is required',
    'user.form.jobRequired': 'Job title is required',
    'user.form.createSuccess': 'User created successfully',
    'user.form.updateSuccess': 'User updated successfully',

    'user.delete.title': 'Delete User',
    'user.delete.confirm': 'Are you sure you want to delete this user?',
    'user.delete.success': 'User deleted successfully',
    'user.delete.warning': 'This action cannot be undone.',

    // Errors
    'error.network': 'Network error. Please check your connection.',
    'error.timeout': 'Request timed out. Please try again.',
    'error.notFound': 'The requested resource was not found.',
    'error.unauthorized': 'You are not authorized to perform this action.',
    'error.forbidden': 'Access denied.',
    'error.validation': 'Please check your input and try again.',
    'error.unknown': 'An unexpected error occurred.',
    'error.storage': 'Storage error. Please try again.',

    // Error Boundary
    'error.boundary.title': 'Something went wrong',
    'error.boundary.message': 'An error occurred while rendering this component.',
    'error.boundary.details': 'Error Details',
    'error.boundary.retry': 'Try Again',
    'error.boundary.reload': 'Reload Page',
    'error.boundary.home': 'Go Home',

    // Error Pages
    'error.page.403.title': 'Access Denied',
    'error.page.403.message': 'You do not have permission to access this resource.',
    'error.page.404.title': 'Page Not Found',
    'error.page.404.message': 'The page you are looking for does not exist or has been moved.',
    'error.page.500.title': 'Server Error',
    'error.page.500.message': 'Something went wrong on our end. Please try again later.',
    'error.page.unknown.title': 'Error',
    'error.page.unknown.message': 'An unexpected error occurred.',
    'error.page.goBack': 'Go Back',
    'error.page.goHome': 'Go Home',

    // Home
    'home.welcome': 'Welcome to Arcana',
    'home.subtitle': 'Your enterprise management dashboard',
    'home.totalUsers': 'Total Users',
    'home.activeProjects': 'Active Projects',
    'home.pendingTasks': 'Pending Tasks',
    'home.messages': 'Messages',

    // Header
    'header.search': 'Search...',
    'header.notifications': 'Notifications',
    'header.profile': 'Profile',
    'header.settings': 'Settings',
    'header.logout': 'Logout'
  },

  zh: {
    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.search': '搜索',
    'common.actions': '操作',
    'common.yes': '是',
    'common.no': '否',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.refresh': '刷新',
    'common.close': '关闭',
    'common.submit': '提交',
    'common.reset': '重置',
    'common.noData': '暂无数据',
    'common.error': '错误',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '信息',

    // Navigation
    'nav.home': '首页',
    'nav.users': '用户',
    'nav.calendar': '日历',
    'nav.messages': '消息',
    'nav.projects': '项目',
    'nav.tasks': '任务',
    'nav.analytics': '分析',
    'nav.settings': '设置',
    'nav.logout': '退出登录',

    // User module
    'user.list.title': '用户管理',
    'user.list.subtitle': '管理系统中的所有用户',
    'user.list.searchPlaceholder': '搜索用户...',
    'user.list.addNew': '添加新用户',
    'user.list.noUsers': '未找到用户',
    'user.list.loadMore': '加载更多',
    'user.list.showing': '显示第 {start} 到 {end} 条，共 {total} 条',

    'user.detail.title': '用户详情',
    'user.detail.back': '返回用户列表',
    'user.detail.email': '邮箱',
    'user.detail.firstName': '名',
    'user.detail.lastName': '姓',
    'user.detail.editUser': '编辑用户',
    'user.detail.deleteUser': '删除用户',

    'user.form.createTitle': '创建新用户',
    'user.form.editTitle': '编辑用户',
    'user.form.name': '姓名',
    'user.form.namePlaceholder': '请输入用户名',
    'user.form.job': '职位',
    'user.form.jobPlaceholder': '请输入职位',
    'user.form.nameRequired': '姓名为必填项',
    'user.form.jobRequired': '职位为必填项',
    'user.form.createSuccess': '用户创建成功',
    'user.form.updateSuccess': '用户更新成功',

    'user.delete.title': '删除用户',
    'user.delete.confirm': '确定要删除此用户吗？',
    'user.delete.success': '用户删除成功',
    'user.delete.warning': '此操作无法撤销。',

    // Errors
    'error.network': '网络错误，请检查您的连接。',
    'error.timeout': '请求超时，请重试。',
    'error.notFound': '请求的资源未找到。',
    'error.unauthorized': '您没有权限执行此操作。',
    'error.forbidden': '访问被拒绝。',
    'error.validation': '请检查您的输入后重试。',
    'error.unknown': '发生未知错误。',
    'error.storage': '存储错误，请重试。',

    // Error Boundary
    'error.boundary.title': '出现错误',
    'error.boundary.message': '渲染此组件时发生错误。',
    'error.boundary.details': '错误详情',
    'error.boundary.retry': '重试',
    'error.boundary.reload': '重新加载',
    'error.boundary.home': '返回首页',

    // Error Pages
    'error.page.403.title': '访问被拒绝',
    'error.page.403.message': '您没有权限访问此资源。',
    'error.page.404.title': '页面未找到',
    'error.page.404.message': '您访问的页面不存在或已被移动。',
    'error.page.500.title': '服务器错误',
    'error.page.500.message': '服务器出现问题，请稍后重试。',
    'error.page.unknown.title': '错误',
    'error.page.unknown.message': '发生未知错误。',
    'error.page.goBack': '返回',
    'error.page.goHome': '返回首页',

    // Home
    'home.welcome': '欢迎使用 Arcana',
    'home.subtitle': '您的企业管理仪表板',
    'home.totalUsers': '用户总数',
    'home.activeProjects': '活跃项目',
    'home.pendingTasks': '待处理任务',
    'home.messages': '消息',

    // Header
    'header.search': '搜索...',
    'header.notifications': '通知',
    'header.profile': '个人资料',
    'header.settings': '设置',
    'header.logout': '退出登录'
  },

  'zh-TW': {
    // Common
    'common.loading': '載入中...',
    'common.save': '儲存',
    'common.cancel': '取消',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.create': '建立',
    'common.search': '搜尋',
    'common.actions': '操作',
    'common.yes': '是',
    'common.no': '否',
    'common.confirm': '確認',
    'common.back': '返回',
    'common.refresh': '重新整理',
    'common.close': '關閉',
    'common.submit': '提交',
    'common.reset': '重設',
    'common.noData': '暫無資料',
    'common.error': '錯誤',
    'common.success': '成功',
    'common.warning': '警告',
    'common.info': '資訊',

    // Navigation
    'nav.home': '首頁',
    'nav.users': '使用者',
    'nav.calendar': '行事曆',
    'nav.messages': '訊息',
    'nav.projects': '專案',
    'nav.tasks': '任務',
    'nav.analytics': '分析',
    'nav.settings': '設定',
    'nav.logout': '登出',

    // User module
    'user.list.title': '使用者管理',
    'user.list.subtitle': '管理系統中的所有使用者',
    'user.list.searchPlaceholder': '搜尋使用者...',
    'user.list.addNew': '新增使用者',
    'user.list.noUsers': '未找到使用者',
    'user.list.loadMore': '載入更多',
    'user.list.showing': '顯示第 {start} 到 {end} 筆，共 {total} 筆',

    'user.detail.title': '使用者詳情',
    'user.detail.back': '返回使用者列表',
    'user.detail.email': '電子郵件',
    'user.detail.firstName': '名',
    'user.detail.lastName': '姓',
    'user.detail.editUser': '編輯使用者',
    'user.detail.deleteUser': '刪除使用者',

    'user.form.createTitle': '建立新使用者',
    'user.form.editTitle': '編輯使用者',
    'user.form.name': '姓名',
    'user.form.namePlaceholder': '請輸入使用者名稱',
    'user.form.job': '職稱',
    'user.form.jobPlaceholder': '請輸入職稱',
    'user.form.nameRequired': '姓名為必填欄位',
    'user.form.jobRequired': '職稱為必填欄位',
    'user.form.createSuccess': '使用者建立成功',
    'user.form.updateSuccess': '使用者更新成功',

    'user.delete.title': '刪除使用者',
    'user.delete.confirm': '確定要刪除此使用者嗎？',
    'user.delete.success': '使用者刪除成功',
    'user.delete.warning': '此操作無法復原。',

    // Errors
    'error.network': '網路錯誤，請檢查您的連線。',
    'error.timeout': '請求逾時，請重試。',
    'error.notFound': '找不到請求的資源。',
    'error.unauthorized': '您沒有權限執行此操作。',
    'error.forbidden': '存取被拒絕。',
    'error.validation': '請檢查您的輸入後重試。',
    'error.unknown': '發生未知錯誤。',
    'error.storage': '儲存錯誤，請重試。',

    // Error Boundary
    'error.boundary.title': '發生錯誤',
    'error.boundary.message': '渲染此組件時發生錯誤。',
    'error.boundary.details': '錯誤詳情',
    'error.boundary.retry': '重試',
    'error.boundary.reload': '重新載入',
    'error.boundary.home': '返回首頁',

    // Error Pages
    'error.page.403.title': '存取被拒絕',
    'error.page.403.message': '您沒有權限存取此資源。',
    'error.page.404.title': '頁面未找到',
    'error.page.404.message': '您訪問的頁面不存在或已被移動。',
    'error.page.500.title': '伺服器錯誤',
    'error.page.500.message': '伺服器發生問題，請稍後重試。',
    'error.page.unknown.title': '錯誤',
    'error.page.unknown.message': '發生未知錯誤。',
    'error.page.goBack': '返回',
    'error.page.goHome': '返回首頁',

    // Home
    'home.welcome': '歡迎使用 Arcana',
    'home.subtitle': '您的企業管理儀表板',
    'home.totalUsers': '使用者總數',
    'home.activeProjects': '活躍專案',
    'home.pendingTasks': '待處理任務',
    'home.messages': '訊息',

    // Header
    'header.search': '搜尋...',
    'header.notifications': '通知',
    'header.profile': '個人資料',
    'header.settings': '設定',
    'header.logout': '登出'
  },

  es: {
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.actions': 'Acciones',
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.confirm': 'Confirmar',
    'common.back': 'Volver',
    'common.refresh': 'Actualizar',
    'common.close': 'Cerrar',
    'common.submit': 'Enviar',
    'common.reset': 'Restablecer',
    'common.noData': 'No hay datos disponibles',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',

    // Navigation
    'nav.home': 'Inicio',
    'nav.users': 'Usuarios',
    'nav.calendar': 'Calendario',
    'nav.messages': 'Mensajes',
    'nav.projects': 'Proyectos',
    'nav.tasks': 'Tareas',
    'nav.analytics': 'Análisis',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',

    // User module
    'user.list.title': 'Gestión de usuarios',
    'user.list.subtitle': 'Gestionar todos los usuarios del sistema',
    'user.list.searchPlaceholder': 'Buscar usuarios...',
    'user.list.addNew': 'Agregar nuevo usuario',
    'user.list.noUsers': 'No se encontraron usuarios',
    'user.list.loadMore': 'Cargar más',
    'user.list.showing': 'Mostrando {start} a {end} de {total} usuarios',

    'user.detail.title': 'Detalles del usuario',
    'user.detail.back': 'Volver a usuarios',
    'user.detail.email': 'Correo electrónico',
    'user.detail.firstName': 'Nombre',
    'user.detail.lastName': 'Apellido',
    'user.detail.editUser': 'Editar usuario',
    'user.detail.deleteUser': 'Eliminar usuario',

    'user.form.createTitle': 'Crear nuevo usuario',
    'user.form.editTitle': 'Editar usuario',
    'user.form.name': 'Nombre',
    'user.form.namePlaceholder': 'Ingrese el nombre del usuario',
    'user.form.job': 'Cargo',
    'user.form.jobPlaceholder': 'Ingrese el cargo',
    'user.form.nameRequired': 'El nombre es obligatorio',
    'user.form.jobRequired': 'El cargo es obligatorio',
    'user.form.createSuccess': 'Usuario creado exitosamente',
    'user.form.updateSuccess': 'Usuario actualizado exitosamente',

    'user.delete.title': 'Eliminar usuario',
    'user.delete.confirm': '¿Está seguro de que desea eliminar este usuario?',
    'user.delete.success': 'Usuario eliminado exitosamente',
    'user.delete.warning': 'Esta acción no se puede deshacer.',

    // Errors
    'error.network': 'Error de red. Por favor, verifique su conexión.',
    'error.timeout': 'Tiempo de espera agotado. Por favor, intente de nuevo.',
    'error.notFound': 'El recurso solicitado no fue encontrado.',
    'error.unauthorized': 'No está autorizado para realizar esta acción.',
    'error.forbidden': 'Acceso denegado.',
    'error.validation': 'Por favor, verifique su entrada e intente de nuevo.',
    'error.unknown': 'Ocurrió un error inesperado.',
    'error.storage': 'Error de almacenamiento. Por favor, intente de nuevo.',

    // Error Boundary
    'error.boundary.title': 'Algo salió mal',
    'error.boundary.message': 'Ocurrió un error al renderizar este componente.',
    'error.boundary.details': 'Detalles del error',
    'error.boundary.retry': 'Reintentar',
    'error.boundary.reload': 'Recargar página',
    'error.boundary.home': 'Ir al inicio',

    // Error Pages
    'error.page.403.title': 'Acceso denegado',
    'error.page.403.message': 'No tiene permiso para acceder a este recurso.',
    'error.page.404.title': 'Página no encontrada',
    'error.page.404.message': 'La página que busca no existe o ha sido movida.',
    'error.page.500.title': 'Error del servidor',
    'error.page.500.message': 'Algo salió mal en nuestro servidor. Por favor, intente más tarde.',
    'error.page.unknown.title': 'Error',
    'error.page.unknown.message': 'Ocurrió un error inesperado.',
    'error.page.goBack': 'Volver',
    'error.page.goHome': 'Ir al inicio',

    // Home
    'home.welcome': 'Bienvenido a Arcana',
    'home.subtitle': 'Su panel de gestión empresarial',
    'home.totalUsers': 'Usuarios totales',
    'home.activeProjects': 'Proyectos activos',
    'home.pendingTasks': 'Tareas pendientes',
    'home.messages': 'Mensajes',

    // Header
    'header.search': 'Buscar...',
    'header.notifications': 'Notificaciones',
    'header.profile': 'Perfil',
    'header.settings': 'Configuración',
    'header.logout': 'Cerrar sesión'
  },

  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.search': 'Rechercher',
    'common.actions': 'Actions',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.refresh': 'Actualiser',
    'common.close': 'Fermer',
    'common.submit': 'Soumettre',
    'common.reset': 'Réinitialiser',
    'common.noData': 'Aucune donnée disponible',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Avertissement',
    'common.info': 'Information',

    // Navigation
    'nav.home': 'Accueil',
    'nav.users': 'Utilisateurs',
    'nav.calendar': 'Calendrier',
    'nav.messages': 'Messages',
    'nav.projects': 'Projets',
    'nav.tasks': 'Tâches',
    'nav.analytics': 'Analyse',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',

    // User module
    'user.list.title': 'Gestion des utilisateurs',
    'user.list.subtitle': 'Gérer tous les utilisateurs du système',
    'user.list.searchPlaceholder': 'Rechercher des utilisateurs...',
    'user.list.addNew': 'Ajouter un nouvel utilisateur',
    'user.list.noUsers': 'Aucun utilisateur trouvé',
    'user.list.loadMore': 'Charger plus',
    'user.list.showing': 'Affichage de {start} à {end} sur {total} utilisateurs',

    'user.detail.title': 'Détails de l\'utilisateur',
    'user.detail.back': 'Retour aux utilisateurs',
    'user.detail.email': 'E-mail',
    'user.detail.firstName': 'Prénom',
    'user.detail.lastName': 'Nom',
    'user.detail.editUser': 'Modifier l\'utilisateur',
    'user.detail.deleteUser': 'Supprimer l\'utilisateur',

    'user.form.createTitle': 'Créer un nouvel utilisateur',
    'user.form.editTitle': 'Modifier l\'utilisateur',
    'user.form.name': 'Nom',
    'user.form.namePlaceholder': 'Entrez le nom de l\'utilisateur',
    'user.form.job': 'Poste',
    'user.form.jobPlaceholder': 'Entrez le poste',
    'user.form.nameRequired': 'Le nom est obligatoire',
    'user.form.jobRequired': 'Le poste est obligatoire',
    'user.form.createSuccess': 'Utilisateur créé avec succès',
    'user.form.updateSuccess': 'Utilisateur mis à jour avec succès',

    'user.delete.title': 'Supprimer l\'utilisateur',
    'user.delete.confirm': 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
    'user.delete.success': 'Utilisateur supprimé avec succès',
    'user.delete.warning': 'Cette action est irréversible.',

    // Errors
    'error.network': 'Erreur réseau. Veuillez vérifier votre connexion.',
    'error.timeout': 'Délai d\'attente dépassé. Veuillez réessayer.',
    'error.notFound': 'La ressource demandée n\'a pas été trouvée.',
    'error.unauthorized': 'Vous n\'êtes pas autorisé à effectuer cette action.',
    'error.forbidden': 'Accès refusé.',
    'error.validation': 'Veuillez vérifier votre saisie et réessayer.',
    'error.unknown': 'Une erreur inattendue s\'est produite.',
    'error.storage': 'Erreur de stockage. Veuillez réessayer.',

    // Error Boundary
    'error.boundary.title': 'Une erreur s\'est produite',
    'error.boundary.message': 'Une erreur s\'est produite lors du rendu de ce composant.',
    'error.boundary.details': 'Détails de l\'erreur',
    'error.boundary.retry': 'Réessayer',
    'error.boundary.reload': 'Recharger la page',
    'error.boundary.home': 'Accueil',

    // Error Pages
    'error.page.403.title': 'Accès refusé',
    'error.page.403.message': 'Vous n\'avez pas la permission d\'accéder à cette ressource.',
    'error.page.404.title': 'Page non trouvée',
    'error.page.404.message': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    'error.page.500.title': 'Erreur serveur',
    'error.page.500.message': 'Une erreur s\'est produite de notre côté. Veuillez réessayer plus tard.',
    'error.page.unknown.title': 'Erreur',
    'error.page.unknown.message': 'Une erreur inattendue s\'est produite.',
    'error.page.goBack': 'Retour',
    'error.page.goHome': 'Accueil',

    // Home
    'home.welcome': 'Bienvenue sur Arcana',
    'home.subtitle': 'Votre tableau de bord de gestion d\'entreprise',
    'home.totalUsers': 'Utilisateurs totaux',
    'home.activeProjects': 'Projets actifs',
    'home.pendingTasks': 'Tâches en attente',
    'home.messages': 'Messages',

    // Header
    'header.search': 'Rechercher...',
    'header.notifications': 'Notifications',
    'header.profile': 'Profil',
    'header.settings': 'Paramètres',
    'header.logout': 'Déconnexion'
  },

  de: {
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.create': 'Erstellen',
    'common.search': 'Suchen',
    'common.actions': 'Aktionen',
    'common.yes': 'Ja',
    'common.no': 'Nein',
    'common.confirm': 'Bestätigen',
    'common.back': 'Zurück',
    'common.refresh': 'Aktualisieren',
    'common.close': 'Schließen',
    'common.submit': 'Absenden',
    'common.reset': 'Zurücksetzen',
    'common.noData': 'Keine Daten verfügbar',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.warning': 'Warnung',
    'common.info': 'Information',

    // Navigation
    'nav.home': 'Startseite',
    'nav.users': 'Benutzer',
    'nav.calendar': 'Kalender',
    'nav.messages': 'Nachrichten',
    'nav.projects': 'Projekte',
    'nav.tasks': 'Aufgaben',
    'nav.analytics': 'Analyse',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',

    // User module
    'user.list.title': 'Benutzerverwaltung',
    'user.list.subtitle': 'Alle Benutzer im System verwalten',
    'user.list.searchPlaceholder': 'Benutzer suchen...',
    'user.list.addNew': 'Neuen Benutzer hinzufügen',
    'user.list.noUsers': 'Keine Benutzer gefunden',
    'user.list.loadMore': 'Mehr laden',
    'user.list.showing': 'Zeige {start} bis {end} von {total} Benutzern',

    'user.detail.title': 'Benutzerdetails',
    'user.detail.back': 'Zurück zu Benutzern',
    'user.detail.email': 'E-Mail',
    'user.detail.firstName': 'Vorname',
    'user.detail.lastName': 'Nachname',
    'user.detail.editUser': 'Benutzer bearbeiten',
    'user.detail.deleteUser': 'Benutzer löschen',

    'user.form.createTitle': 'Neuen Benutzer erstellen',
    'user.form.editTitle': 'Benutzer bearbeiten',
    'user.form.name': 'Name',
    'user.form.namePlaceholder': 'Benutzernamen eingeben',
    'user.form.job': 'Berufsbezeichnung',
    'user.form.jobPlaceholder': 'Berufsbezeichnung eingeben',
    'user.form.nameRequired': 'Name ist erforderlich',
    'user.form.jobRequired': 'Berufsbezeichnung ist erforderlich',
    'user.form.createSuccess': 'Benutzer erfolgreich erstellt',
    'user.form.updateSuccess': 'Benutzer erfolgreich aktualisiert',

    'user.delete.title': 'Benutzer löschen',
    'user.delete.confirm': 'Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?',
    'user.delete.success': 'Benutzer erfolgreich gelöscht',
    'user.delete.warning': 'Diese Aktion kann nicht rückgängig gemacht werden.',

    // Errors
    'error.network': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
    'error.timeout': 'Zeitüberschreitung. Bitte versuchen Sie es erneut.',
    'error.notFound': 'Die angeforderte Ressource wurde nicht gefunden.',
    'error.unauthorized': 'Sie sind nicht berechtigt, diese Aktion auszuführen.',
    'error.forbidden': 'Zugriff verweigert.',
    'error.validation': 'Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.',
    'error.unknown': 'Ein unerwarteter Fehler ist aufgetreten.',
    'error.storage': 'Speicherfehler. Bitte versuchen Sie es erneut.',

    // Error Boundary
    'error.boundary.title': 'Etwas ist schiefgelaufen',
    'error.boundary.message': 'Beim Rendern dieser Komponente ist ein Fehler aufgetreten.',
    'error.boundary.details': 'Fehlerdetails',
    'error.boundary.retry': 'Erneut versuchen',
    'error.boundary.reload': 'Seite neu laden',
    'error.boundary.home': 'Zur Startseite',

    // Error Pages
    'error.page.403.title': 'Zugriff verweigert',
    'error.page.403.message': 'Sie haben keine Berechtigung, auf diese Ressource zuzugreifen.',
    'error.page.404.title': 'Seite nicht gefunden',
    'error.page.404.message': 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
    'error.page.500.title': 'Serverfehler',
    'error.page.500.message': 'Auf unserer Seite ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
    'error.page.unknown.title': 'Fehler',
    'error.page.unknown.message': 'Ein unerwarteter Fehler ist aufgetreten.',
    'error.page.goBack': 'Zurück',
    'error.page.goHome': 'Zur Startseite',

    // Home
    'home.welcome': 'Willkommen bei Arcana',
    'home.subtitle': 'Ihr Unternehmens-Management-Dashboard',
    'home.totalUsers': 'Benutzer gesamt',
    'home.activeProjects': 'Aktive Projekte',
    'home.pendingTasks': 'Ausstehende Aufgaben',
    'home.messages': 'Nachrichten',

    // Header
    'header.search': 'Suchen...',
    'header.notifications': 'Benachrichtigungen',
    'header.profile': 'Profil',
    'header.settings': 'Einstellungen',
    'header.logout': 'Abmelden'
  }
}

// Current language state
const currentLanguage = ref<Language>(getStoredLanguage())

function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidLanguage(stored)) {
      return stored as Language
    }
  }
  return 'en'
}

function isValidLanguage(lang: string): lang is Language {
  return AVAILABLE_LANGUAGES.some(l => l.code === lang)
}

/**
 * Translate a key with optional parameters
 */
export function translate(key: string, params?: Record<string, string | number>): string {
  const lang = currentLanguage.value
  let text = translations[lang]?.[key] ?? translations['en']?.[key] ?? key

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    })
  }

  return text
}

/**
 * Composable for i18n
 */
export function useI18n() {
  const language = computed(() => currentLanguage.value)

  const languageInfo = computed(() =>
    AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage.value) ?? AVAILABLE_LANGUAGES[0]
  )

  function setLanguage(lang: Language) {
    currentLanguage.value = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang)
    }
  }

  function t(key: string, params?: Record<string, string | number>): string {
    return translate(key, params)
  }

  return {
    language,
    languageInfo,
    availableLanguages: AVAILABLE_LANGUAGES,
    setLanguage,
    t,
    translate
  }
}

/**
 * Vue plugin for i18n
 */
export const i18nPlugin: Plugin = {
  install(app: App) {
    app.config.globalProperties.$t = translate
    app.provide('i18n', useI18n())
  }
}
