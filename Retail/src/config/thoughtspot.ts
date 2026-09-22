import { AuthType, EmbedConfig } from '@thoughtspot/visual-embed-sdk';

/** ThoughtSpot worksheet / model GUID for Search, Iris (AI), and Explore embeds */
export const THOUGHTSPOT_MODEL_ID = '2b5bd538-1687-42a7-9987-96a464889419';

/** Liveboard GUID for LiveboardEmbed (saved dashboard) */
export const THOUGHTSPOT_LIVEBOARD_ID = 'cd408f8e-6f29-4a14-af5f-ddaf57ee04d2';

/** Cadences liveboard GUID */
export const THOUGHTSPOT_CADENCES_LIVEBOARD_ID = '6222d312-b654-4856-b131-fbcddc6bf4e7';

/** Cadences data model (worksheet) GUID */
export const THOUGHTSPOT_CADENCES_MODEL_ID = '6aa13b75-12d9-493b-a44a-f4ab845152d4';

/** Toy Store Demo Model GUID — used by the Overview liveboard filters & parameters */
export const TOY_STORE_MODEL_ID = '2b5bd538-1687-42a7-9987-96a464889419';

/** ThoughtSpot Cloud cluster origin (no trailing slash) */
export const thoughtSpotHost = 'https://se-thoughtspot-cloud.thoughtspot.cloud';

export const EMBED_APP_BACKGROUND = '#0C0C0C';
export const TOP_HEADER_PX = 56;
export const VIEWPORT_LESS_TOP_HEADER = `calc(100vh - ${TOP_HEADER_PX}px)`;

const publicBase = process.env.PUBLIC_URL ?? '';
export const DATABOT_ICON_URL = `${publicBase}/maison-icons.svg`;

// ─── Lumira brand palette ─────────────────────────────────────────────────
const BRAND_PRIMARY      = '#2B3CC1';
const BRAND_PRIMARY_DARK = '#1E2FA8';
const BRAND_LIGHT        = 'rgba(43,60,193,0.08)';
const BRAND_HOVER        = 'rgba(43,60,193,0.14)';
const BRAND_GLOW         = 'rgba(43,60,193,0.10)';
const INTER_FONT         = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ─── Liveboard light tile scale (Lumira) ─────────────────────────────────
const LB_BG            = '#F0F2FF';                    // outer layout — light periwinkle
const LB_BG_2          = '#E5E8FA';                    // header band / alt rows
const LB_BG_3          = '#D8DCFA';                    // elevated surfaces
const LB_TILE          = '#FFFFFF';                    // tile / viz card surface
const LB_TILE_ALT      = '#F0F2FF';                    // alternating table row
const LB_TILE_HDR      = '#E5E8FA';                    // table column headers
const LB_BORDER        = 'rgba(43,60,193,0.10)';       // tile and row borders
const INK              = '#1f2124';                    // primary text
const INK70            = 'rgba(31,33,36,0.70)';
const INK55            = 'rgba(31,33,36,0.55)';
const INK45            = 'rgba(31,33,36,0.45)';

/**
 * Global init customizations — comprehensive Lumira brand override.
 * Covers SpotterEmbed, SearchEmbed, and LiveboardEmbed so no ThoughtSpot
 * internal branding (orange / teal / TS-navy) bleeds through.
 */
const globalStyleVariables: Record<string, string> = {
  '--ts-var-root-font-family':                    INTER_FONT,
  '--ts-var-root-color':                          BRAND_PRIMARY,
  '--ts-var-application-color':                   BRAND_PRIMARY,

  // ── Chips ────────────────────────────────────────────────────────────────
  '--ts-var-chip-background':                     BRAND_LIGHT,
  '--ts-var-chip-color':                          BRAND_PRIMARY,
  '--ts-var-chip-border-radius':                  '6px',
  '--ts-var-chip--active-background':             BRAND_PRIMARY,
  '--ts-var-chip--active-color':                  '#FFFFFF',
  '--ts-var-chip--hover-background':              BRAND_HOVER,
  '--ts-var-chip--hover-color':                   BRAND_PRIMARY,
  '--ts-var-chip-title-font-family':              INTER_FONT,
  '--ts-var-parameter-chip-text-color':           BRAND_PRIMARY,

  // ── Buttons ──────────────────────────────────────────────────────────────
  '--ts-var-button--primary-background':          BRAND_PRIMARY,
  '--ts-var-button--primary-color':               '#FFFFFF',
  '--ts-var-button--primary--hover-background':   BRAND_PRIMARY_DARK,
  '--ts-var-button--primary--active-background':  BRAND_PRIMARY_DARK,
  '--ts-var-button--primary--font-family':        INTER_FONT,
  '--ts-var-button--secondary-background':        BRAND_LIGHT,
  '--ts-var-button--secondary-color':             BRAND_PRIMARY,
  '--ts-var-button--secondary--hover-background': BRAND_HOVER,
  '--ts-var-button-border-radius':                '6px',
  '--ts-var-button--icon-border-radius':          '50%',

  // ── Search bar ───────────────────────────────────────────────────────────
  '--ts-var-search-bar-background':               '#F0F2FF',
  '--ts-var-search-bar-color':                    '#0F1875',
  '--ts-var-search-data-panel-background':        '#FFFFFF',
  '--ts-var-search-bar-border-color':             BRAND_LIGHT,
  '--ts-var-search-highlight-color':              BRAND_PRIMARY,
  '--ts-var-search-autocomplete-background':      '#FFFFFF',

  // ── Menus ────────────────────────────────────────────────────────────────
  '--ts-var-menu-font-family':                    INTER_FONT,
  '--ts-var-menu--hover-background':              BRAND_LIGHT,
  '--ts-var-menu-selected-text-color':            BRAND_PRIMARY,
  '--ts-var-menu-color':                          '#1f2124',
  '--ts-var-menu-background':                     '#FFFFFF',

  // ── Nav / top bar ────────────────────────────────────────────────────────
  '--ts-var-nav-background':                      '#0F1875',
  '--ts-var-nav-color':                           '#FFFFFF',
  '--ts-var-top-nav-color':                       '#FFFFFF',
  '--ts-var-top-nav-background':                  '#0F1875',

  // ── Spotter / AI chat ────────────────────────────────────────────────────
  '--ts-var-spotter-background':                  '#FFFFFF',
  '--ts-var-spotter-response-background':         '#F0F2FF',
  '--ts-var-spotter-user-background':             BRAND_PRIMARY,
  '--ts-var-spotter-user-color':                  '#FFFFFF',
  '--ts-var-spotter-input-background':            '#F0F2FF',
  '--ts-var-spotter-input-border-color':          BRAND_LIGHT,
  '--ts-var-spotter-accent-color':                BRAND_PRIMARY,
  '--ts-var-spotter-send-button-background':      BRAND_PRIMARY,
  '--ts-var-spotter-send-button-color':           '#FFFFFF',
};

/**
 * Per-embed customizations for LiveboardEmbed — light xSuite theme.
 * Matches the app's white / #F4F6FB palette so the embed blends in.
 */
export const LIVEBOARD_DARK_CUSTOMIZATIONS = {
  style: {
    customCSS: {
      variables: {
        // ── Liveboard layout ─────────────────────────────────────────────
        '--ts-var-liveboard-layout-background':              LB_BG,
        '--ts-var-liveboard-header-background':              LB_BG_2,
        '--ts-var-liveboard-header-font-color':              INK,
        '--ts-var-liveboard-notetitle-heading-font-color':   INK,
        '--ts-var-liveboard-notetitle-body-font-color':      INK70,
        '--ts-var-liveboard-tile-background':                LB_TILE,
        '--ts-var-liveboard-tile-border-radius':             '10px',
        '--ts-var-liveboard-tile-border-color':              LB_BORDER,
        '--ts-var-liveboard-group-background':               LB_BG,
        '--ts-var-liveboard-group-title-font-color':         INK,
        '--ts-var-liveboard-group-border-color':             LB_BORDER,
        '--ts-var-liveboard-group-description-font-color':   INK45,
        '--ts-var-liveboard-group-tile-title-font-color':    INK,


        // ── Viz tile surfaces ────────────────────────────────────────────
        '--ts-var-viz-background':                           LB_TILE,
        '--ts-var-viz-border-radius':                        '10px',
        '--ts-var-viz-box-shadow':                           '0 1px 6px rgba(43,60,193,0.08)',
        '--ts-var-viz-title-color':                          INK,
        '--ts-var-viz-title-font-family':                    INTER_FONT,
        '--ts-var-viz-description-color':                    INK55,
        '--ts-var-viz-description-font-family':              INTER_FONT,
        '--ts-var-viz-legend-hover-background':              BRAND_GLOW,

        // ── Chart axes ───────────────────────────────────────────────────
        '--ts-var-axis-title-color':                         INK55,
        '--ts-var-axis-title-font-family':                   INTER_FONT,
        '--ts-var-axis-data-label-color':                    INK45,
        '--ts-var-axis-data-label-font-family':              INTER_FONT,

        // ── Menus + dialogs ──────────────────────────────────────────────
        '--ts-var-menu-color':                               INK,
        '--ts-var-menu-background':                          LB_BG,
        '--ts-var-menu-separator-background':                LB_BORDER,
        '--ts-var-dialog-body-background':                   LB_BG,
        '--ts-var-dialog-body-color':                        INK,
        '--ts-var-dialog-header-background':                 LB_BG_2,
        '--ts-var-dialog-header-color':                      INK,
        '--ts-var-dialog-footer-background':                 LB_BG_2,

        // ── ag-Grid variables ────────────────────────────────────────────
        '--ag-background-color':                             LB_TILE,
        '--ag-odd-row-background-color':                     LB_TILE_ALT,
        '--ag-header-background-color':                      LB_TILE_HDR,
        '--ag-foreground-color':                             INK,
        '--ag-data-color':                                   INK,
        '--ag-secondary-foreground-color':                   INK55,
        '--ag-header-foreground-color':                      INK55,
        '--ag-border-color':                                 LB_BORDER,
        '--ag-row-border-color':                             LB_BORDER,
        '--ag-row-hover-color':                              'rgba(43,60,193,0.05)',
        '--ag-selected-row-background-color':                'rgba(43,60,193,0.07)',
        '--ag-range-selection-border-color':                 BRAND_PRIMARY,
        '--ag-input-focus-border-color':                     BRAND_PRIMARY,
        '--ag-checkbox-checked-color':                       BRAND_PRIMARY,
      } as Record<string, string>,
      rules_UNSTABLE: {
        // ── Filter bar padding ────────────────────────────────────────────
        '[class*="filterRow"]':        { 'padding-top': '4px !important', 'padding-bottom': '4px !important' },
        '[class*="filter-row"]':       { 'padding-top': '4px !important', 'padding-bottom': '4px !important' },
        '[class*="compactHeader"]':    { 'padding-top': '4px !important', 'padding-bottom': '4px !important', 'min-height': 'unset !important' },
        '[class*="compact-header"]':   { 'padding-top': '4px !important', 'padding-bottom': '4px !important', 'min-height': 'unset !important' },
        '[class*="liveboardFilter"]':  { 'padding-top': '4px !important', 'padding-bottom': '4px !important' },
        '[class*="FilterBar"]':        { 'padding-top': '4px !important', 'padding-bottom': '4px !important' },

        // ── ag-Grid class overrides ───────────────────────────────────────
        '.ag-root':                              { 'background-color': '#FFFFFF !important', 'color': '#1f2124 !important' },
        '.ag-root-wrapper':                      { 'background-color': '#FFFFFF !important' },
        '.ag-center-cols-container':             { 'background-color': '#FFFFFF !important' },
        '.ag-cell':                              { 'color': '#1f2124 !important', 'border-color': 'rgba(43,60,193,0.10) !important' },
        '.ag-cell-value':                        { 'color': '#1f2124 !important' },
        '.ag-cell-wrapper':                      { 'color': '#1f2124 !important' },
        '.ag-group-value':                       { 'color': '#1f2124 !important' },
        '.ag-row':                               { 'background-color': '#FFFFFF !important', 'border-color': 'rgba(43,60,193,0.10) !important' },
        '.ag-row-even':                          { 'background-color': '#FFFFFF !important' },
        '.ag-row-odd':                           { 'background-color': '#F0F2FF !important' },
        '.ag-row:hover':                         { 'background-color': 'rgba(43,60,193,0.05) !important' },
        '.ag-header':                            { 'background-color': '#E5E8FA !important', 'border-color': 'rgba(43,60,193,0.10) !important' },
        '.ag-header-row':                        { 'background-color': '#E5E8FA !important' },
        '.ag-header-cell':                       { 'background-color': '#E5E8FA !important', 'color': 'rgba(31,33,36,0.55) !important' },
        '.ag-header-cell-label':                 { 'color': 'rgba(31,33,36,0.55) !important' },
        '.ag-header-cell-text':                  { 'color': 'rgba(31,33,36,0.55) !important' },
        '.ag-pinned-left-cols-container .ag-cell':  { 'background-color': '#FFFFFF !important', 'color': '#1f2124 !important' },
        '.ag-pinned-right-cols-container .ag-cell': { 'background-color': '#FFFFFF !important', 'color': '#1f2124 !important' },
        '.ag-cell a':                            { 'color': '#2B3CC1 !important' },
        '.ag-cell-value a':                      { 'color': '#2B3CC1 !important' },
        '.ag-group-value a':                     { 'color': '#2B3CC1 !important' },

        // ── Table cells ───────────────────────────────────────────────────
        '[class*="tableCell"]':        { 'color': '#1f2124 !important' },
        '[class*="table-cell"]':       { 'color': '#1f2124 !important' },
        '[class*="headerCell"]':       { 'color': 'rgba(31,33,36,0.55) !important', 'background-color': '#E5E8FA !important' },
        '[class*="agCell"]':           { 'color': '#1f2124 !important' },
        'td':                          { 'color': '#1f2124 !important', 'border-color': 'rgba(43,60,193,0.10) !important' },
        'th':                          { 'color': 'rgba(31,33,36,0.55) !important', 'background-color': '#E5E8FA !important', 'border-color': 'rgba(43,60,193,0.10) !important' },

        // ── KPI / headline numbers ────────────────────────────────────────
        '[class*="headlineValue"]':    { 'color': '#0F1875 !important' },
        '[class*="kpiValue"]':         { 'color': '#0F1875 !important' },
        '[class*="numberValue"]':      { 'color': '#0F1875 !important' },
        '[class*="metricValue"]':      { 'color': '#0F1875 !important' },
        '[class*="comparisonValue"]':  { 'color': 'rgba(31,33,36,0.65) !important' },

        // ── Legend labels ─────────────────────────────────────────────────
        '[class*="legendLabel"]':      { 'color': 'rgba(31,33,36,0.70) !important' },
        '[class*="legendItem"]':       { 'color': 'rgba(31,33,36,0.70) !important' },

        // ── Tooltip ───────────────────────────────────────────────────────
        '[class*="tooltip"]':          { 'background-color': '#FFFFFF !important', 'color': '#1f2124 !important', 'border-color': 'rgba(43,60,193,0.12) !important', 'box-shadow': '0 4px 16px rgba(43,60,193,0.12) !important' },
        '[class*="tooltipValue"]':     { 'color': '#0F1875 !important' },

        // ── Summary / total rows ──────────────────────────────────────────
        '[class*="summaryRow"]':       { 'background-color': '#E0E5FF !important', 'color': '#1f2124 !important' },
        '[class*="totalRow"]':         { 'background-color': '#E0E5FF !important', 'color': '#0F1875 !important' },

        // ── Link text ─────────────────────────────────────────────────────
        'a':                           { 'color': '#2B3CC1 !important' },
        'a:hover':                     { 'color': '#1E2FA8 !important' },
        '[class*="link"]':             { 'color': '#2B3CC1 !important' },
        '[class*="Link"]':             { 'color': '#2B3CC1 !important' },
        '[class*="attributeValue"]':   { 'color': '#2B3CC1 !important' },
        '[class*="cellLink"]':         { 'color': '#2B3CC1 !important' },
      },
    },
  },
};

/**
 * Liveboard customizations with the top header bar hidden.
 * Use for embeds where the host page supplies its own title / tab switcher.
 */
export const LIVEBOARD_NO_HEADER_CUSTOMIZATIONS = {
  ...LIVEBOARD_DARK_CUSTOMIZATIONS,
  style: {
    ...LIVEBOARD_DARK_CUSTOMIZATIONS.style,
    customCSS: {
      ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS,
      rules_UNSTABLE: {
        ...LIVEBOARD_DARK_CUSTOMIZATIONS.style.customCSS.rules_UNSTABLE,
        '[class*="liveboardHeader"]':  { display: 'none !important' },
        '[class*="liveboard-header"]': { display: 'none !important' },
        '[class*="pinboardHeader"]':   { display: 'none !important' },
        '[class*="pinboard-header"]':  { display: 'none !important' },
        '[class*="liveboardTitle"]':   { display: 'none !important' },
        '[class*="liveboardTopBar"]':  { display: 'none !important' },
        '[class*="top-bar"]':          { display: 'none !important' },
        '[class*="filterRow"]':        { display: 'none !important' },
        '[class*="filter-row"]':       { display: 'none !important' },
        '[class*="liveboardFilter"]':  { display: 'none !important' },
        '[class*="FilterBar"]':        { display: 'none !important' },
      },
    },
  },
};

// ─── Comprehensive raw CSS overrides ─────────────────────────────────────────
// Blanket-covers all ThoughtSpot internal colors (orange/teal/TS-navy) so
// nothing outside the Lumira blue/purple palette bleeds through.
const GLOBAL_RAW_CSS: Record<string, Record<string, string>> = {

  // ── Hide ALL ThoughtSpot branding / watermarks / footer ──────────────────
  '[class*="tsLogo"], [class*="ts-logo"], [class*="thoughtspotLogo"], [class*="poweredBy"], [class*="poweredByTs"], [class*="brandingContainer"], [class*="brandingLogo"], [class*="tsWatermark"], [id*="ts-logo"], [class*="poweredByContainer"], [class*="watermark"], [class*="footer-branding"], [class*="footerBranding"]':
    { display: 'none !important' },
  // target the exact "Powered by ThoughtSpot" text node wrapper used in Spotter
  'a[href*="thoughtspot"], a[href*="ThoughtSpot"]':
    { display: 'none !important' },

  // ── Spotter / AI full-page background → light lavender ───────────────────
  'body, html':
    { backgroundColor: '#F0F2FF !important' },
  '[class*="spotterRoot"], [class*="spotter-root"], [class*="appRoot"], [class*="app-root"]':
    { backgroundColor: '#F0F2FF !important' },
  '[class*="emptyState"], [class*="empty-state"], [class*="welcomeScreen"], [class*="welcome-screen"], [class*="landingPage"], [class*="landing-page"]':
    { backgroundColor: '#F0F2FF !important' },
  '[class*="centerContent"], [class*="center-content"], [class*="pageContent"], [class*="page-content"]':
    { backgroundColor: '#F0F2FF !important' },
  '[class*="spotterPage"], [class*="mainContent"], [class*="main-content"], [class*="contentArea"], [class*="content-area"]':
    { backgroundColor: '#F0F2FF !important' },
  // Spotter input bar wrapper
  '[class*="inputWrapper"], [class*="input-wrapper"], [class*="chatFooter"], [class*="chat-footer"]':
    { backgroundColor: '#E5E8FA !important', borderTop: '1px solid rgba(43,60,193,0.12) !important' },
  // The central greeting icon ring
  '[class*="iconContainer"], [class*="icon-container"], [class*="avatarContainer"]':
    { color: '#2B3CC1 !important', fill: '#2B3CC1 !important' },

  // ── Override ThoughtSpot orange → Lumira blue ─────────────────────────
  '[class*="orangeText"], [class*="orange-text"]':
    { color: `${BRAND_PRIMARY} !important` },
  '[class*="orangeBg"], [class*="orange-bg"], [class*="orangeBackground"]':
    { backgroundColor: `${BRAND_PRIMARY} !important` },

  // ── Global link colors ────────────────────────────────────────────────────
  'a': { color: `${BRAND_PRIMARY} !important` },
  'a:hover': { color: `${BRAND_PRIMARY_DARK} !important` },

  // ── Search bar ───────────────────────────────────────────────────────────
  '[class*="searchBar"], [class*="search-bar"], [class*="SearchBar"]':
    { background: '#F0F2FF !important', borderColor: 'rgba(43,60,193,0.20) !important' },
  '[class*="searchInput"], [class*="search-input"]':
    { color: '#0F1875 !important', fontFamily: `${INTER_FONT} !important` },
  '[class*="searchHighlight"], [class*="highlight"]':
    { color: `${BRAND_PRIMARY} !important`, backgroundColor: 'rgba(43,60,193,0.10) !important' },
  '[class*="searchDataPanel"], [class*="search-data-panel"]':
    { background: '#FFFFFF !important' },

  // ── Top nav / header bar ─────────────────────────────────────────────────
  '[class*="topNavigation"], [class*="top-navigation"], [class*="navBar"], [class*="nav-bar"], [class*="appHeader"], [class*="app-header"]':
    { backgroundColor: '#0F1875 !important', borderColor: 'rgba(255,255,255,0.08) !important' },
  '[class*="navItem"], [class*="nav-item"]':
    { color: 'rgba(232,238,248,0.70) !important' },
  '[class*="navItem--active"], [class*="navItemActive"]':
    { color: '#FFFFFF !important', backgroundColor: `${BRAND_PRIMARY} !important` },

  // ── Sidebar / left panel ─────────────────────────────────────────────────
  '[class*="leftNav"], [class*="left-nav"], [class*="sideNav"], [class*="sidePanel"]':
    { backgroundColor: '#0F1875 !important' },

  // ── Spotter / AI chat bubbles ─────────────────────────────────────────────
  '[class*="userMessage"], [class*="user-message"], [class*="humanMessage"]':
    { backgroundColor: `${BRAND_PRIMARY} !important`, color: '#FFFFFF !important', borderRadius: '12px 12px 2px 12px !important' },
  '[class*="aiMessage"], [class*="ai-message"], [class*="assistantMessage"], [class*="spotterMessage"], [class*="agentMessage"]':
    { backgroundColor: '#F0F2FF !important', borderRadius: '12px 12px 12px 2px !important' },
  '[class*="chatInput"], [class*="chat-input"], [class*="queryInput"], [class*="promptInput"]':
    { borderColor: `rgba(43,60,193,0.25) !important`, backgroundColor: '#F0F2FF !important' },
  '[class*="sendButton"], [class*="send-button"], [class*="submitButton"]':
    { backgroundColor: `${BRAND_PRIMARY} !important`, borderColor: `${BRAND_PRIMARY} !important` },
  '[class*="spotterContainer"], [class*="spotter-container"], [class*="conversationContainer"]':
    { backgroundColor: '#FFFFFF !important' },
  '[class*="sparkleIcon"], [class*="aiIcon"], [class*="irisIcon"]':
    { color: `${BRAND_PRIMARY} !important`, fill: `${BRAND_PRIMARY} !important` },

  // ── Buttons (secondary / ghost / icon) ───────────────────────────────────
  'button[class*="primary"], [class*="btn-primary"], [class*="primaryButton"]':
    { backgroundColor: `${BRAND_PRIMARY} !important`, borderColor: `${BRAND_PRIMARY} !important`, color: '#FFFFFF !important' },
  'button[class*="secondary"], [class*="btn-secondary"]':
    { borderColor: `rgba(43,60,193,0.30) !important`, color: `${BRAND_PRIMARY} !important` },

  // ── Focus rings / outlines ────────────────────────────────────────────────
  '*:focus-visible':
    { outlineColor: `${BRAND_PRIMARY} !important` },
  '[class*="focusRing"], [class*="focus-ring"]':
    { borderColor: `${BRAND_PRIMARY} !important`, boxShadow: `0 0 0 3px rgba(43,60,193,0.20) !important` },

  // ── Progress / loading bars ───────────────────────────────────────────────
  '[class*="progressBar"], [class*="progress-bar"], [class*="loadingBar"]':
    { backgroundColor: `${BRAND_PRIMARY} !important` },
  '[class*="spinner"], [class*="loadingSpinner"]':
    { borderTopColor: `${BRAND_PRIMARY} !important`, borderColor: `rgba(43,60,193,0.20) ${BRAND_PRIMARY} rgba(43,60,193,0.20) rgba(43,60,193,0.20) !important` },

  // ── Tabs ─────────────────────────────────────────────────────────────────
  '[class*="activeTab"], [class*="active-tab"], [class*="selectedTab"]':
    { color: `${BRAND_PRIMARY} !important`, borderBottomColor: `${BRAND_PRIMARY} !important` },
  '[class*="tabIndicator"], [class*="tab-indicator"]':
    { backgroundColor: `${BRAND_PRIMARY} !important` },

  // ── Toggles / switches ────────────────────────────────────────────────────
  '[class*="toggle--active"], [class*="switch--on"], [class*="checkbox--checked"]':
    { backgroundColor: `${BRAND_PRIMARY} !important` },
  'input[type="checkbox"]:checked, input[type="radio"]:checked':
    { accentColor: `${BRAND_PRIMARY} !important` },

  // ── Highlights / selections ───────────────────────────────────────────────
  '[class*="isSelected"], [class*="is-selected"], [class*="selected-row"]':
    { backgroundColor: `rgba(43,60,193,0.08) !important` },
  '[class*="hovered"], [class*="is-hovered"]':
    { backgroundColor: `rgba(43,60,193,0.05) !important` },

  // ── Tag / badge colors ────────────────────────────────────────────────────
  '[class*="badge"], [class*="tag"], [class*="pill"]':
    { backgroundColor: `${BRAND_LIGHT} !important`, color: `${BRAND_PRIMARY} !important`, borderColor: `rgba(43,60,193,0.20) !important` },
  '[class*="badge--primary"], [class*="tag--primary"]':
    { backgroundColor: `${BRAND_PRIMARY} !important`, color: '#FFFFFF !important' },
};

export function buildThoughtSpotEmbedConfig(): EmbedConfig {
  return {
    thoughtSpotHost,
    authType: AuthType.None,
    suppressSearchEmbedBetaWarning: true,
    customizations: {
      iconSpriteUrl: "https://cdn.jsdelivr.net/gh/CamTS256/icon-store/robot11.svg",
      style: {
        customCSS: {
          variables: globalStyleVariables,
          rules_UNSTABLE: GLOBAL_RAW_CSS,
        },
      },
      content: {
        strings: {
          Spotter: 'Lumira AI',
          Iris: 'Lumira AI',
          'Meet Iris, your AI analyst': 'Meet Lumira AI, your commerce analyst',
          'Iris is your AI analyst. It can answer questions you have about your data source and help you find insights quickly.\n To start analysing, ask a business question about your data.': 'Lumira AI can answer questions about your sales and channel data and surface insights instantly.\n To start, ask a business question about your data.',
          'AI Highlights': 'Highlights',
          Pin: 'Pin',
        },
      },
    },
  };
}
