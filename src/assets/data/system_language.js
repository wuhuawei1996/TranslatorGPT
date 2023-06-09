const Chinese = {
  translating: "正在翻译",
  recognizing: "正在识别",
  proofreading: "正在润色",
  gettingSelected: "正在获取选中内容",
  translatingError: "翻译失败, 可能是由于频率过高，请稍后重试。",
  proofreadingError: "润色失败, 可能是由于频率过高，请稍后重试。",
  autoLanguage: "自动检测",
  sourceLanguage: "源语言",
  targetLanguage: "目标语言",
  inputRawContent: "请输入要翻译的内容。",
  inputRawContentForProofreading: "请输入要润色的内容。",
  hint: "提示：",
  inputHints:
    "请输入用于提示翻译的信息，格式为：“提示1+提示2+提示3...”。（非必选）",
  inputProofreadingHints:
    "请输入用于提示润色的信息，格式为：“提示1+提示2+提示3...”。（非必选）",
  notFound: "未找到",
  engine: "翻译引擎",
  noEngine: "无可用引擎",
  noContent: "未选择要翻译的内容。",
  noContentToProofread: "未选择要润色的内容。",
  noSourceLanguage: "未选择源语言。",
  translation: "译文：",
  menu: ["翻译", "润色" /*"翻译记录"*/],
  translate: "翻译",
  proofread: "润色",
  beforeProofreading: "润色前",
  afterProofreading: "润色后",
  clear: "清空",
  stop: "停止",
  copy: "复制",
  succeedToCopy: "复制成功。",
  failToCopy: "复制失败。",
  select: "划词",
  capture: "截屏",
  period: "。",
  settings: {
    settings: "设置",
    basic: "基础设置",
    apiKey: "API 密钥",
    shortcut: "快捷键",
    translation: "翻译设置",
    aboutMe: "关于作者",
    startOnBoot: "开机自启动",
    autoToTray: "启动后最小化到系统托盘",
    alwaysOnTop: "主窗口始终置顶",
    autoUpdate: "自动更新",
    openMainOnSelection: "划词翻译时打开主窗口",
    openMainOnScreenshot: "截屏翻译时打开主窗口",
    closeMainWindow: "关闭主窗口时：",
    hideToTray: "隐藏到系统托盘",
    quit: "退出程序",
    language: "系统语言：",
    fontSize: "字体大小：",
    small: "小",
    standard: "标准",
    large: "大",
    huge: "超大",
    inputTheKey: "请输入密钥。",
    test: "测试",
    showOrHide: "显示/隐藏：",
    selection: "划词翻译：",
    screenshot: "截屏翻译：",
    recordShortcut: "点击以录制快捷键。",
    save: "保存",
    cancel: "取消",
    notTested: "请先测试所有的密钥。",
    pass: "通过",
    testSuccess: "测试通过。",
    testFailed: "测试未通过。",
    enableAutoLaunchFailed: "设置开机自启动失败。",
    disableAutoLaunchFailed: "取消开机自启动失败。",
  },
  changeToMain: "发送数据到主窗口",
  treatMe:
    "如果你觉得这个软件帮助到了你，请给我的 Github 加颗星吧，也可以请我喝杯咖啡。",
};

const English = {
  translating: "Translating",
  recognizing: "Recognizing",
  proofreading: "Proofreading",
  gettingSelected: "Getting selected content",
  translatingError:
    "Translation failed, possibly due to frequent requests. Please try again later.",
  proofreadingError:
    "Proofreading failed, possibly due to frequent requests. Please try again later.",
  autoLanguage: "Automatic",
  sourceLanguage: "Source Language",
  targetLanguage: "Target Language",
  hint: "Prompt: ",
  inputHints:
    'Please enter the information for prompting translation in the format of "prompt1+prompt2+prompt3...". (Optional)',
  inputProofreadingHints:
    'Please enter the information for prompting proofreading in the format of "prompt1+prompt2+prompt3...". (Optional)',
  inputRawContent: "Please enter the content to be translated.",
  inputRawContentForProofreading: "Please enter the content to be proofread.",
  notFound: "Not Found",
  engine: "Engine",
  noEngine: "No available Engines",
  noContent: "No content selected to translate.",
  noContentToProofread: "No content selected to proofread.",
  noSourceLanguage: "No source language selected.",
  translation: "Translation: ",
  menu: ["Translator", "Proofreader" /*"History"*/],
  translate: "Translate",
  proofread: "Proofread",
  beforeProofreading: "Original",
  afterProofreading: "Proofread",
  clear: "Clear",
  stop: "Stop",
  copy: "Copy",
  succeedToCopy: "Copy succeeded.",
  failToCopy: "Copy failed.",
  select: "Selection",
  capture: "Screenshot",
  period: ".",
  settings: {
    settings: "Settings",
    basic: "Basics",
    apiKey: "API Keys",
    shortcut: "Shortcuts",
    translation: "Translation",
    aboutMe: "About Me",
    startOnBoot: "Auto-start on boot",
    autoToTray: "Minimize to system tray on startup",
    alwaysOnTop: "Main window always on top",
    autoUpdate: "Auto update",
    openMainOnSelection: "Open main window when translating by selection",
    openMainOnScreenshot: "Open main window when translating by screenshot",
    closeMainWindow: "If the main window closed: ",
    hideToTray: "Hide to system tray",
    quit: "Quit the software",
    language: "System language: ",
    fontSize: "Font size: ",
    small: "Small",
    standard: "Standard",
    large: "Large",
    huge: "Huge",
    inputTheKey: "Please enter the API key.",
    test: "Test",
    showOrHide: "Show/Hide: ",
    selection: "Word Selection: ",
    screenshot: "Screenshot: ",
    recordShortcut: "Click to record shortcut key.",
    save: "Save",
    cancel: "Cancel",
    notTested: "Please test all the API keys first.",
    pass: "Pass",
    testSuccess: "Test passed.",
    testFailed: "Test not passed.",
    enableAutoLaunchFailed: "Failed to enable auto-start on boot.",
    disableAutoLaunchFailed: "Failed to disable auto-start on boot.",
  },
  changeToMain: "Send data to main window",
  treatMe:
    "If you feel this software has helped you, please give my GitHub a star and you can also treat me to a cup of coffee.",
};

const French = {
  translating: "Traduction",
  recognizing: "Reconnaissance",
  proofreading: "Correction",
  gettingSelected: "Obtenir le contenu sélectionné",
  translatingError:
    "La traduction a échoué, probablement en raison de requêtes fréquentes. Veuillez réessayer ultérieurement.",
  proofreadingError:
    "La relecture a échoué, peut-être en raison de demandes fréquentes. Veuillez réessayer plus tard.",
  autoLanguage: "Automatique",
  sourceLanguage: "Langue source",
  targetLanguage: "Langue cible",
  hint: "Rapide: ",
  inputHints:
    'Veuillez entrer les informations pour déclencher la traduction au format "rapide1+rapide2+rapide3...". (Facultatif)',
  inputProofreadingHints:
    'Veuillez entrer les informations pour solliciter une relecture dans le format "rapide1+rapide2+rapide3..." (Facultatif).',
  inputRawContent: "Veuillez entrer le contenu à traduire.",
  inputRawContentForProofreading: "S'il vous plaît entrez le contenu à relire.",
  notFound: "Non trouvé",
  engine: "Moteur",
  noEngine: "Aucun moteur disponible",
  noContent: "Aucun contenu sélectionné à traduire.",
  noContentToProofread: "Aucun contenu sélectionné à relire.",
  noSourceLanguage: "Aucune langue source sélectionnée.",
  translation: "Traduction: ",
  menu: ["Traducteur", "Correcteur" /*"Histoire"*/],
  translate: "Traduire",
  proofread: "Relisez",
  beforeProofreading: "Original",
  afterProofreading: "Relecture",
  clear: "Clair",
  stop: "Arrêt",
  copy: "Copier",
  succeedToCopy: "Copie réussie.",
  failToCopy: "La copie a échoué.",
  select: "Sélection",
  capture: "Capture d'écran",
  period: ".",
  settings: {
    settings: "Paramètres",
    basic: "Bases",
    apiKey: "Clés API",
    shortcut: "Raccourcis",
    translation: "Traduction",
    aboutMe: "À Propos",
    startOnBoot: "Démarrage automatique lors du démarrage",
    autoToTray: "Réduire dans la zone de notification au démarrage",
    alwaysOnTop: "Fenêtre principale toujours au premier plan",
    autoUpdate: "Mise à jour automatique",
    openMainOnSelection:
      "Ouvrir la fenêtre principale lors de la traduction par sélection",
    openMainOnScreenshot:
      "Ouvrir la fenêtre principale lors de la traduction par capture d'écran",
    closeMainWindow: "Si la fenêtre principale est fermée: ",
    hideToTray: "Cacher dans la zone de notification",
    quit: "Language du système",
    language: "Langue système: ",
    fontSize: "Taille de police: ",
    small: "Petit",
    standard: "Standard",
    large: "Grand",
    huge: "Immense",
    inputTheKey: "Veuillez entrer la clé API.",
    test: "Test",
    showOrHide: "Afficher/Masquer: ",
    selection: "Sélection de mots: ",
    screenshot: "Capture d'écran: ",
    recordShortcut: "Cliquez pour enregistrer la touche de raccourci.",
    save: "Enregistrer",
    cancel: "Annuler",
    notTested: "Veuillez d'abord tester toutes les clés API.",
    pass: "Passe",
    testSuccess: "Test réussi.",
    testFailed: "Test non réussi.",
    enableAutoLaunchFailed:
      "Impossible d'activer le démarrage automatique au démarrage.",
    disableAutoLaunchFailed:
      "N'a pas réussi à désactiver le démarrage automatique au démarrage.",
  },
  changeToMain: "Envoyer des données à la fenêtre principale",
  treatMe:
    "Si vous estimez que ce logiciel vous a été utile, donnez-moi une étoile sur GitHub et vous pouvez aussi me faire plaisir en m'offrant une tasse de café.",
};

export default {
  Chinese,
  English,
  French,
};
