import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('splitwise_theme_mode') || 'dark';
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('splitverse_active_theme') || 'cyberpunk';
  });

  const [activeAvatar, setActiveAvatar] = useState(() => {
    return localStorage.getItem('splitverse_active_avatar') || 'cyber-glow';
  });

  const [isDark, setIsDark] = useState(() => {
    const savedMode = localStorage.getItem('splitwise_theme_mode');
    if (savedMode === 'light') return false;
    return true; // Default to dark mode for SplitVerse AI
  });

  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('splitverse_privacy_mode') === 'true';
  });

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      localStorage.setItem('splitverse_privacy_mode', String(next));
      return next;
    });
  };

  const setAppTheme = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('splitverse_active_theme', themeId);
    if (themeId === 'minimal-white') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const setAvatar = (avatarId) => {
    setActiveAvatar(avatarId);
    localStorage.setItem('splitverse_active_avatar', avatarId);
  };

  const formatAmount = (amount, currency = '₹') => {
    if (privacyMode) return `${currency}••••`;
    const num = Number(amount) || 0;
    return `${currency}${num.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    const updateTheme = () => {
      let activeDark = true;
      if (themeMode === 'light' || activeTheme === 'minimal-white') {
        activeDark = false;
      } else {
        activeDark = true;
      }

      setIsDark(activeDark);
      const root = document.documentElement;
      const body = document.body;

      // Remove existing theme classes
      root.classList.remove(
        'theme-cyberpunk',
        'theme-amoled',
        'theme-glass',
        'theme-luxury-gold',
        'theme-bmw-blue',
        'theme-minimal-white',
        'theme-supercar'
      );

      // Add current theme class
      root.classList.add(`theme-${activeTheme}`);

      if (activeDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }

      localStorage.setItem('splitwise_theme_mode', themeMode);
      localStorage.setItem('splitwise_theme', activeDark ? 'dark' : 'light');
      localStorage.setItem('splitverse_active_theme', activeTheme);
    };

    updateTheme();

    // Listen to OS system theme changes if set to system
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (themeMode === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode, activeTheme]);

  const toggleTheme = () => {
    if (isDark) {
      setAppTheme('minimal-white');
    } else {
      setAppTheme('cyberpunk');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        setThemeMode,
        activeTheme,
        setAppTheme,
        activeAvatar,
        setAvatar,
        toggleTheme,
        privacyMode,
        togglePrivacyMode,
        formatAmount
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
