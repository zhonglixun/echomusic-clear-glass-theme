const PLUGIN_ID = 'clear-glass-theme';
const ACTIVE_CLASS = 'ql-theme-active';

const DEFAULT_SETTINGS = {
  surface: 58,
  glow: 62,
  softShadow: true,
  colorfulIcons: true,
  iconSidebar: true,
  iconShortcuts: true,
  iconTitlebar: true,
  iconPlayer: true,
  iconContent: true,
};

const PRESETS = [
  {
    id: 'qinglan-mint',
    title: '晴岚 · 薄荷',
    tint: 'mint',
    accent: '#2f9c84',
    darkAccent: '#82dec5',
    accentStrong: '#1b7462',
    accent2: '#5b92ad',
    accent3: '#c98470',
    accent4: '#8b82c4',
    darkAccent2: '#9bc9df',
    darkAccent3: '#efb4a2',
    darkAccent4: '#c1b8ef',
    shell: '#e5f7ef',
    sidebar: '#eefaf5',
    main: '#f5fbf8',
    description: '更明显的薄荷绿空气感，清爽但不刺眼。',
    gradient:
      'linear-gradient(138deg, #dff4e9 0%, #d9f3ee 18%, #ecfaf4 42%, #f4f8ff 68%, #fff5ee 88%, #fffdf9 100%)',
  },
  {
    id: 'qinglan-sky',
    title: '晴岚 · 晴空',
    tint: 'sky',
    accent: '#4c87d8',
    darkAccent: '#82b8f4',
    accentStrong: '#2d60a8',
    accent2: '#748fd8',
    accent3: '#cb877c',
    accent4: '#9b87cf',
    darkAccent2: '#a9bdf4',
    darkAccent3: '#efb3aa',
    darkAccent4: '#c8b7f0',
    shell: '#e6f0fd',
    sidebar: '#eff6fe',
    main: '#f6faff',
    description: '真正的天青蓝背景与蓝色强调色，清爽干净，不偏青绿。',
    gradient:
      'linear-gradient(142deg, #dfeaff 0%, #dcefff 20%, #eef7ff 43%, #f5f2ff 68%, #fff1e8 88%, #fffdfb 100%)',
  },
];

function buildTheme(preset) {
  return {
    id: preset.id,
    title: preset.title,
    description: preset.description,
    type: 'default',
    defaultMode: 'light',
    variants: {
      light: {
        accent: preset.accent,
        tokens: {
          shell: preset.shell,
          sidebar: preset.sidebar,
          main: preset.main,
          card: '#ffffff',
          elevated: '#ffffff',
          player: '#f5fbfb',
          text: '#16363d',
          secondary: '#5b777d',
          border: '#d5e9ea',
        },
        floating: {
          background: '#fbfefe',
          card: '#f1fbfa',
          text: '#16363d',
          secondary: '#5b777d',
          border: '#d5e9ea',
        },
        background: { gradient: preset.gradient },
      },
      dark: {
        accent: preset.darkAccent,
        tokens: {
          shell: '#0d2027',
          sidebar: '#112830',
          main: '#132d35',
          card: '#17343c',
          elevated: '#193940',
          player: '#142e36',
          text: '#eefafa',
          secondary: '#a8c4c8',
          border: '#29464d',
        },
        floating: {
          background: '#152f37',
          card: '#1a3941',
          text: '#effafa',
          secondary: '#a8c4c8',
          border: '#2c4b52',
        },
        background: {
          gradient:
            'linear-gradient(135deg, #0a1c22 0%, #102830 42%, #122b36 72%, #0b1c24 100%)',
        },
      },
    },
  };
}

function normalizeSettings(value) {
  const input = value && typeof value === 'object' ? value : {};
  const glow = Number(input.glow);
  return {
    surface: Math.min(82, Math.max(32, Number(input.surface) || DEFAULT_SETTINGS.surface)),
    glow: Math.min(100, Math.max(0, Number.isFinite(glow) ? glow : DEFAULT_SETTINGS.glow)),
    softShadow: input.softShadow !== false,
    colorfulIcons: input.colorfulIcons !== false,
    iconSidebar: input.iconSidebar !== false,
    iconShortcuts: input.iconShortcuts !== false,
    iconTitlebar: input.iconTitlebar !== false,
    iconPlayer: input.iconPlayer !== false,
    iconContent: input.iconContent !== false,
  };
}

function validateSettings(value) {
  if (!value || typeof value !== 'object') return false;
  return (
    Number.isFinite(value.surface) &&
    value.surface >= 32 &&
    value.surface <= 82 &&
    Number.isFinite(value.glow) &&
    value.glow >= 0 &&
    value.glow <= 100 &&
    typeof value.softShadow === 'boolean' &&
    typeof value.colorfulIcons === 'boolean' &&
    typeof value.iconSidebar === 'boolean' &&
    typeof value.iconShortcuts === 'boolean' &&
    typeof value.iconTitlebar === 'boolean' &&
    typeof value.iconPlayer === 'boolean' &&
    typeof value.iconContent === 'boolean'
  );
}

function createSettingsComponent(ctx, preset) {
  const { defineComponent, h, ref, nextTick, onMounted } = ctx.vue;
  const rootRef = ref(null);

  const rowStyle =
    'display:grid;gap:6px;min-width:0';
  const labelStyle = 'display:grid;gap:3px;min-width:0';
  const titleStyle = 'font-size:13px;font-weight:600';
  const hintStyle = 'font-size:11px;opacity:.58;line-height:1.55';
  const rangeStyle =
    `width:100%;accent-color:${preset.accent};height:18px;margin:0;cursor:pointer`;

  const settingRow = (title, hint, control) =>
    h('div', { style: rowStyle }, [
      h('div', { style: labelStyle }, [
        h('span', { style: titleStyle }, title),
        h('span', { style: hintStyle }, hint),
      ]),
      control,
    ]);

  return defineComponent({
    name: 'QinglanThemeSettings',
    setup() {
      const theme = ctx.theme.useTheme();
      const current = () => normalizeSettings(theme.settings.value);
      const patch = (value) => theme.updateSettings({ ...current(), ...value });

      onMounted(() => {
        nextTick(() => {
          const details = rootRef.value?.closest?.('details.theme-plugin-settings');
          if (details) details.open = true;
        });
      });

      const slider = (key, min, max, suffix = '%') => {
        const value = current()[key];
        return h('div', { style: 'display:flex;align-items:center;gap:10px' }, [
          h('input', {
            type: 'range',
            min: String(min),
            max: String(max),
            step: '1',
            value: String(value),
            'aria-label': key,
            style: rangeStyle,
            onInput: (event) => patch({ [key]: Number(event.target.value) }),
          }),
          h(
            'span',
            {
              style:
                'font-size:11px;font-variant-numeric:tabular-nums;opacity:.62;min-width:34px;text-align:right',
            },
            `${value}${suffix}`,
          ),
        ]);
      };

      const switchRow = (title, hint, key, disabled = false, compact = false) =>
        h(
          'div',
          {
            style: [
              'display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:0',
              compact ? 'min-height:34px' : 'min-height:48px',
              disabled ? 'opacity:.42' : '',
            ].join(';'),
          },
          [
            h('div', { style: 'display:grid;gap:3px;min-width:0' }, [
              h('span', { style: `font-size:${compact ? 12 : 13}px;font-weight:${compact ? 500 : 600}` }, title),
              hint
                ? h('span', { style: 'font-size:11px;opacity:.58;line-height:1.55' }, hint)
                : null,
            ]),
            h(
              'button',
              {
                type: 'button',
                class: 'ql-theme-switch',
                role: 'switch',
                'aria-checked': String(Boolean(current()[key])),
                'aria-label': title,
                disabled,
                onClick: () => patch({ [key]: !current()[key] }),
              },
              [
                h('span', { class: 'ql-theme-switch-track' }, [
                  h('span', { class: 'ql-theme-switch-knob' }),
                ]),
                h(
                  'span',
                  { class: 'ql-theme-switch-state' },
                  current()[key] ? '开' : '关',
                ),
              ],
            ),
          ],
        );

      return () =>
        h('div', { ref: rootRef, style: 'display:grid;gap:16px;padding:4px 0 8px' }, [
          settingRow('面板雾白度', '提高后卡片更实，降低后更通透。', slider('surface', 32, 82)),
          settingRow('氛围光感', '只影响背景柔光，不影响文字对比度。', slider('glow', 0, 100)),
          switchRow('柔和层次阴影', '关闭后界面更平、更干净。', 'softShadow'),
          switchRow(
            '多彩图标点缀（总开关）',
            '只控制装饰性图标色；红心、星标等语义色始终保留。',
            'colorfulIcons',
          ),
          h(
            'div',
            {
              style:
                'display:grid;gap:3px;margin-top:-5px;padding:2px 0 2px 13px',
            },
            [
              h('span', { style: 'font-size:10px;font-weight:600;letter-spacing:.08em;opacity:.48' }, '分区控制'),
              switchRow(
                '侧栏 · 音乐菜单与歌单',
                '「音乐菜单」中的导航图标，以及歌单标题旁的刷新、添加和排序按钮。',
                'iconSidebar',
                !current().colorfulIcons,
                true,
              ),
              switchRow(
                '侧栏 · 常用功能卡片',
                '快捷卡中的功能图标与「＋」添加按钮；自定义入口保留原生色。',
                'iconShortcuts',
                !current().colorfulIcons,
                true,
              ),
              switchRow(
                '标题栏 · 顶部工具',
                '顶部工具栏中的「听歌识曲」与搜索框放大镜。',
                'iconTitlebar',
                !current().colorfulIcons,
                true,
              ),
              switchRow(
                '播放栏 · 操作图标',
                '悬停、按下或激活时转为主题色；静止状态沿用原生对比度，收藏红心保持红色。',
                'iconPlayer',
                !current().colorfulIcons,
                true,
              ),
              switchRow(
                '内容区 · 入口与歌曲操作',
                '排行榜卡片的点缀色、「外观调整」入口，以及歌曲行操作的悬停反馈。',
                'iconContent',
                !current().colorfulIcons,
                true,
              ),
            ],
          ),
        ]);
    },
  });
}

let activeOwner = null;

function createBackdrop(ctx, preset) {
  const { defineComponent, h, watch, onMounted, onBeforeUnmount } = ctx.vue;

  return defineComponent({
    name: 'QinglanBackdrop',
    setup() {
      const theme = ctx.theme.useTheme();
      const root = document.documentElement;
      const owner = {};
      let semanticObserver = null;
      let semanticFrame = 0;

      const markSemanticIcons = () => {
        semanticFrame = 0;
        document.querySelectorAll('#main-sidebar .sidebar-nav-item').forEach((item) => {
          const label = item.querySelector('.sidebar-item-label')?.textContent?.trim() || '';
          let semantic = '';
          if (label === '我最喜爱') semantic = 'favorite';
          else if (label === '播放历史') semantic = 'history';
          else if (label === '私人 FM') semantic = 'radio';
          else if (label === '音乐云盘') semantic = 'cloud';
          if (semantic) item.dataset.qlSemantic = semantic;
          else delete item.dataset.qlSemantic;
        });
      };

      const scheduleSemanticScan = () => {
        if (semanticFrame) return;
        semanticFrame = requestAnimationFrame(markSemanticIcons);
      };

      const apply = () => {
        const settings = normalizeSettings(theme.settings.value);
        const accent = String(theme.accentColor?.value || preset.accent);
        const isDark = Boolean(theme.isDark?.value);
        activeOwner = owner;
        root.classList.add(ACTIVE_CLASS);
        root.dataset.qlTint = preset.tint;
        root.dataset.qlShadow = settings.softShadow ? 'on' : 'off';
        root.dataset.qlIcons = settings.colorfulIcons ? 'colorful' : 'native';
        root.dataset.qlIconSidebar = settings.colorfulIcons && settings.iconSidebar ? 'on' : 'off';
        root.dataset.qlIconShortcuts = settings.colorfulIcons && settings.iconShortcuts ? 'on' : 'off';
        root.dataset.qlIconTitlebar = settings.colorfulIcons && settings.iconTitlebar ? 'on' : 'off';
        root.dataset.qlIconPlayer = settings.colorfulIcons && settings.iconPlayer ? 'on' : 'off';
        root.dataset.qlIconContent = settings.colorfulIcons && settings.iconContent ? 'on' : 'off';
        root.style.setProperty('--ql-accent', accent);
        root.style.setProperty('--ql-accent-strong', isDark ? accent : preset.accentStrong);
        root.style.setProperty('--ql-accent-2', isDark ? preset.darkAccent2 : preset.accent2);
        root.style.setProperty('--ql-accent-3', isDark ? preset.darkAccent3 : preset.accent3);
        root.style.setProperty('--ql-accent-4', isDark ? preset.darkAccent4 : preset.accent4);
        root.style.setProperty('--ql-surface-alpha', (settings.surface / 100).toFixed(2));
        root.style.setProperty('--ql-surface-soft', Math.max(0.14, settings.surface / 100 - 0.2).toFixed(2));
        root.style.setProperty('--ql-surface-strong', Math.min(0.9, settings.surface / 100 + 0.18).toFixed(2));
        root.style.setProperty('--ql-glow-alpha', (settings.glow / 100).toFixed(2));
      };

      const clear = () => {
        if (activeOwner !== owner) return;
        activeOwner = null;
        semanticObserver?.disconnect();
        semanticObserver = null;
        if (semanticFrame) cancelAnimationFrame(semanticFrame);
        semanticFrame = 0;
        document.querySelectorAll('#main-sidebar [data-ql-semantic]').forEach((item) => {
          delete item.dataset.qlSemantic;
        });
        root.classList.remove(ACTIVE_CLASS);
        delete root.dataset.qlTint;
        delete root.dataset.qlShadow;
        delete root.dataset.qlIcons;
        delete root.dataset.qlIconSidebar;
        delete root.dataset.qlIconShortcuts;
        delete root.dataset.qlIconTitlebar;
        delete root.dataset.qlIconPlayer;
        delete root.dataset.qlIconContent;
        [
          '--ql-accent',
          '--ql-accent-strong',
          '--ql-accent-2',
          '--ql-accent-3',
          '--ql-accent-4',
          '--ql-surface-alpha',
          '--ql-surface-soft',
          '--ql-surface-strong',
          '--ql-glow-alpha',
        ].forEach((name) => root.style.removeProperty(name));
      };

      onMounted(() => {
        apply();
        markSemanticIcons();
        semanticObserver = new MutationObserver(scheduleSemanticScan);
        semanticObserver.observe(document.body, { childList: true, subtree: true });
      });
      watch(
        () =>
          JSON.stringify({
            settings: theme.settings.value,
            accent: theme.accentColor?.value,
            dark: theme.isDark?.value,
          }),
        () => {
          apply();
          scheduleSemanticScan();
        },
      );
      onBeforeUnmount(clear);

      return () =>
        h(
          'div',
          {
            class: 'ql-atmosphere',
            'aria-hidden': 'true',
            style: {
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
            },
          },
          [
            h('i', { class: 'ql-halo ql-halo-a' }),
            h('i', { class: 'ql-halo ql-halo-b' }),
            h('i', { class: 'ql-halo ql-halo-c' }),
            h('i', { class: 'ql-wash ql-wash-a' }),
            h('i', { class: 'ql-wash ql-wash-b' }),
            h('i', { class: 'ql-sheen' }),
          ],
        );
    },
  });
}

export function activate(ctx) {
  if (!ctx.theme || typeof ctx.theme.register !== 'function') {
    throw new Error('晴岚主题需要支持 ctx.theme 的 EchoMusic 版本');
  }

  for (const preset of PRESETS) {
    ctx.theme.register({
      ...buildTheme(preset),
      settings: {
        defaults: DEFAULT_SETTINGS,
        validate: validateSettings,
        component: createSettingsComponent(ctx, preset),
      },
      decorations: {
        background: createBackdrop(ctx, preset),
      },
    });
  }

  console.info(
    `[${PLUGIN_ID}] 已注册两款主题，请在「主题中心」中选择：${PRESETS.map((item) => item.title).join(' / ')}`,
  );
}

export function deactivate() {}
