import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import FloatingCalculator from './components/FloatingCalculator';
import ExpenseModal from './components/ExpenseModal';
import SettleModal from './components/SettleModal';
import ManualBillModal from './components/ManualBillModal';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import NewGroupModal from './components/NewGroupModal';
import JoinGroupModal from './components/JoinGroupModal';
import ServerStatusBanner from './components/ServerStatusBanner';

// SplitVerse AI New Modals
import CommandPalette from './components/CommandPalette';
import AIAccountantModal from './components/AIAccountantModal';
import VoiceExpenseModal from './components/VoiceExpenseModal';
import WhatsAppImportModal from './components/WhatsAppImportModal';
import LiveRestaurantSplitModal from './components/LiveRestaurantSplitModal';
import SpotifyWrappedModal from './components/SpotifyWrappedModal';
import AIRoastModal from './components/AIRoastModal';
import SecurityLockModal from './components/SecurityLockModal';
import ThemeSelectorModal from './components/ThemeSelectorModal';
import MultiAgentHubModal from './components/MultiAgentHubModal';
import AutoRulesModal from './components/AutoRulesModal';
import AIKeySettingsModal from './components/AIKeySettingsModal';

// Pages
import Dashboard from './pages/Dashboard';
import GroupDetails from './pages/GroupDetails';
import AllExpenses from './pages/AllExpenses';
import SettlementsPage from './pages/SettlementsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import RecurringBillsPage from './pages/RecurringBillsPage';
import GamificationView from './pages/GamificationView';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinGroup from './pages/JoinGroup';

// Super App Ecosystem Pages
import LifeDashboard from './pages/LifeDashboard';
import HomeHubPage from './pages/HomeHubPage';
import ExtendedHubsView from './pages/ExtendedHubsView';

function ProtectedLayout({
  children,
  onOpenCalculator,
  onOpenManualBill,
  onOpenReceiptScan,
  onOpenSettle,
  onOpenNewGroup,
  onOpenJoinGroup,
  onOpenExpenseModal,
  onOpenCommandPalette,
  onOpenVoice,
  onOpenAI,
  onOpenAIKey,
  onOpenThemes,
  onOpenMultiAgent,
  onOpenAutoRules
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 dark:text-slate-100">
      <Navbar
        onOpenCalculator={onOpenCalculator}
        onOpenManualBill={onOpenManualBill}
        onOpenReceiptScan={onOpenReceiptScan}
        onOpenSettle={onOpenSettle}
        onOpenNewGroup={onOpenNewGroup}
        onOpenCommandPalette={onOpenCommandPalette}
        onOpenVoice={onOpenVoice}
        onOpenAI={onOpenAI}
        onOpenAIKey={onOpenAIKey}
        onOpenThemes={onOpenThemes}
        onOpenMultiAgent={onOpenMultiAgent}
        onOpenAutoRules={onOpenAutoRules}
      />
      <div className="flex flex-1 max-w-7xl w-full mx-auto relative z-10">
        <Sidebar
          onOpenNewGroup={onOpenNewGroup}
          onOpenJoinGroup={onOpenJoinGroup}
          onOpenCalculator={onOpenCalculator}
          onOpenThemes={onOpenThemes}
          onOpenMultiAgent={onOpenMultiAgent}
          onOpenAutoRules={onOpenAutoRules}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        onOpenCalculator={onOpenCalculator}
        onOpenExpenseModal={onOpenExpenseModal}
      />
    </div>
  );
}

function MainApp() {
  // Global modal states
  const [calcOpen, setCalcOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [activeGroupIdForExpense, setActiveGroupIdForExpense] = useState('');
  const [activeExpenseData, setActiveExpenseData] = useState(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleProps, setSettleProps] = useState({});
  const [manualBillOpen, setManualBillOpen] = useState(false);
  const [manualBillData, setManualBillData] = useState(null);
  const [receiptScanOpen, setReceiptScanOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);

  // SplitVerse AI Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiAccountantOpen, setAiAccountantOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [whatsAppImportOpen, setWhatsAppImportOpen] = useState(false);
  const [restaurantSplitOpen, setRestaurantSplitOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);
  const [roastOpen, setRoastOpen] = useState(false);
  const [securityLockOpen, setSecurityLockOpen] = useState(false);

  // Super App & Theme Modals
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [multiAgentOpen, setMultiAgentOpen] = useState(false);
  const [autoRulesOpen, setAutoRulesOpen] = useState(false);
  const [aiKeyModalOpen, setAiKeyModalOpen] = useState(false);

  const openExpenseModal = (groupId = '', expenseData = null) => {
    setActiveGroupIdForExpense(groupId || (expenseData?.group_id ? expenseData.group_id : ''));
    setActiveExpenseData(expenseData);
    setExpenseModalOpen(true);
  };

  const openSettleModal = (groupId = '', payerId = '', payeeId = '', amount = '') => {
    setSettleProps({ groupId, initialPayerId: payerId, initialPayeeId: payeeId, initialAmount: amount });
    setSettleModalOpen(true);
  };

  const handleVoiceParsedExpense = (parsed) => {
    openExpenseModal('', {
      description: parsed.description,
      amount: parsed.amount,
      category: parsed.category,
      notes: `Voice input: "${parsed.rawText}"`
    });
  };

  const openManualBill = (billData = null) => {
    setManualBillData(billData);
    setManualBillOpen(true);
  };

  const sharedLayoutProps = {
    onOpenCalculator: () => setCalcOpen(true),
    onOpenManualBill: (billData = null) => openManualBill(billData),
    onOpenReceiptScan: () => setReceiptScanOpen(true),
    onOpenSettle: () => openSettleModal(),
    onOpenNewGroup: () => setNewGroupOpen(true),
    onOpenJoinGroup: () => setJoinGroupOpen(true),
    onOpenExpenseModal: openExpenseModal,
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onOpenVoice: () => setVoiceModalOpen(true),
    onOpenAI: () => setAiAccountantOpen(true),
    onOpenAIKey: () => setAiKeyModalOpen(true),
    onOpenThemes: () => setThemeModalOpen(true),
    onOpenMultiAgent: () => setMultiAgentOpen(true),
    onOpenAutoRules: () => setAutoRulesOpen(true)
  };

  return (
    <div className="relative min-h-screen">
      {/* Background ambient lighting */}
      <div className="ambient-glow" />
      <ServerStatusBanner />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join/:code" element={<JoinGroup />} />

        {/* Super App Ecosystem: Life Dashboard */}
        <Route
          path="/life"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <LifeDashboard
                onOpenAI={() => setAiAccountantOpen(true)}
                onOpenMultiAgent={() => setMultiAgentOpen(true)}
                onOpenThemes={() => setThemeModalOpen(true)}
              />
            </ProtectedLayout>
          }
        />

        {/* Super App Ecosystem: Roommate OS & Chore Wheel */}
        <Route
          path="/home-hub"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <HomeHubPage onOpenExpenseModal={openExpenseModal} />
            </ProtectedLayout>
          }
        />

        {/* Dedicated 1-Tap Maid & Cook Payroll Route */}
        <Route
          path="/maid"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <HomeHubPage defaultTab="staff" onOpenExpenseModal={openExpenseModal} />
            </ProtectedLayout>
          }
        />

        {/* Super App Ecosystem: Specialized Life Hubs (Goals, Vault, Arbitrage, Mobility) */}
        <Route
          path="/hubs"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <ExtendedHubsView />
            </ProtectedLayout>
          }
        />

        {/* Expense Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <Dashboard
                onOpenExpenseModal={openExpenseModal}
                onOpenCalculator={() => setCalcOpen(true)}
                onOpenManualBill={(billData = null) => openManualBill(billData)}
                onOpenReceiptScan={() => setReceiptScanOpen(true)}
                onOpenSettle={() => openSettleModal()}
                onOpenNewGroup={() => setNewGroupOpen(true)}
                onOpenJoinGroup={() => setJoinGroupOpen(true)}
                onOpenVoice={() => setVoiceModalOpen(true)}
                onOpenAI={() => setAiAccountantOpen(true)}
                onOpenWhatsApp={() => setWhatsAppImportOpen(true)}
                onOpenRestaurantSplit={() => setRestaurantSplitOpen(true)}
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/groups/:id"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <GroupDetails
                onOpenExpenseModal={openExpenseModal}
                onOpenSettle={openSettleModal}
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <AllExpenses onOpenExpenseModal={openExpenseModal} />
            </ProtectedLayout>
          }
        />

        {/* Travel section redirect to home-hub */}
        <Route
          path="/travel"
          element={<Navigate to="/home-hub" replace />}
        />

        <Route
          path="/recurring"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <RecurringBillsPage onOpenManualBill={(billData) => openManualBill(billData)} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <GamificationView />
            </ProtectedLayout>
          }
        />

        <Route
          path="/settlements"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <SettlementsPage onOpenSettle={openSettleModal} />
            </ProtectedLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <ReportsPage />
            </ProtectedLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLayout {...sharedLayoutProps}>
              <ProfilePage />
            </ProtectedLayout>
          }
        />

        {/* Root fallback redirects to Life Dashboard */}
        <Route path="*" element={<Navigate to="/life" replace />} />
      </Routes>

      {/* Floating Quick Action Calculator Launcher */}
      <button
        onClick={() => setCalcOpen(!calcOpen)}
        title="Open Calculator"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-13 h-13 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition"
      >
        <Calculator className="w-6 h-6" />
      </button>

      {/* SplitVerse Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenVoice={() => setVoiceModalOpen(true)}
        onOpenAI={() => setAiAccountantOpen(true)}
        onOpenReceipt={() => setReceiptScanOpen(true)}
        onOpenWhatsApp={() => setWhatsAppImportOpen(true)}
        onOpenRestaurantSplit={() => setRestaurantSplitOpen(true)}
        onOpenWrapped={() => setWrappedOpen(true)}
        onOpenRoast={() => setRoastOpen(true)}
        onOpenLock={() => setSecurityLockOpen(true)}
        onOpenThemes={() => setThemeModalOpen(true)}
        onOpenMultiAgent={() => setMultiAgentOpen(true)}
        onOpenAutoRules={() => setAutoRulesOpen(true)}
      />

      <AIAccountantModal
        isOpen={aiAccountantOpen}
        onClose={() => setAiAccountantOpen(false)}
        onOpenSettle={openSettleModal}
      />

      <VoiceExpenseModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onParsedExpense={handleVoiceParsedExpense}
      />

      <WhatsAppImportModal
        isOpen={whatsAppImportOpen}
        onClose={() => setWhatsAppImportOpen(false)}
        defaultGroupId={activeGroupIdForExpense}
        onImportSuccess={() => window.location.reload()}
      />

      <LiveRestaurantSplitModal
        isOpen={restaurantSplitOpen}
        onClose={() => setRestaurantSplitOpen(false)}
        onSplitSuccess={() => window.location.reload()}
      />

      <SpotifyWrappedModal
        isOpen={wrappedOpen}
        onClose={() => setWrappedOpen(false)}
      />

      <AIRoastModal
        isOpen={roastOpen}
        onClose={() => setRoastOpen(false)}
      />

      <SecurityLockModal
        isOpen={securityLockOpen}
        onClose={() => setSecurityLockOpen(false)}
      />

      <ThemeSelectorModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      <MultiAgentHubModal
        isOpen={multiAgentOpen}
        onClose={() => setMultiAgentOpen(false)}
        onOpenSettle={openSettleModal}
        onOpenExpense={() => openExpenseModal()}
      />

      <AutoRulesModal
        isOpen={autoRulesOpen}
        onClose={() => setAutoRulesOpen(false)}
        onRuleExecuted={(rule) => {
          openExpenseModal('', {
            description: rule.title,
            amount: rule.amount,
            category: rule.category
          });
        }}
      />

      <AIKeySettingsModal
        isOpen={aiKeyModalOpen}
        onClose={() => setAiKeyModalOpen(false)}
      />

      {/* Core Splitwise Modals */}
      <FloatingCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setActiveExpenseData(null);
        }}
        defaultGroupId={activeGroupIdForExpense}
        editExpenseData={activeExpenseData}
        onExpenseSaved={() => {
          window.location.reload();
        }}
      />

      <SettleModal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        groupId={settleProps.groupId}
        initialPayerId={settleProps.initialPayerId}
        initialPayeeId={settleProps.initialPayeeId}
        initialAmount={settleProps.initialAmount}
        onSettled={() => {
          window.location.reload();
        }}
      />

      <ManualBillModal
        isOpen={manualBillOpen}
        initialBill={manualBillData}
        onClose={() => {
          setManualBillOpen(false);
          setManualBillData(null);
        }}
        onConvertToExpense={(expenseData) => {
          openExpenseModal(expenseData.group_id || '', expenseData);
        }}
        onBillSaved={() => {
          // Trigger a custom event so Dashboard and Bills page re-fetch
          window.dispatchEvent(new Event('splitverse:bill-saved'));
        }}
      />

      <ReceiptScannerModal
        isOpen={receiptScanOpen}
        onClose={() => setReceiptScanOpen(false)}
        onApplyToExpense={(expenseData) => {
          openExpenseModal(expenseData.group_id || '', expenseData);
        }}
        onOpenInManualBill={(billData) => {
          setReceiptScanOpen(false);
          openManualBill(billData);
        }}
        onBillSaved={() => {
          window.dispatchEvent(new Event('splitverse:bill-saved'));
        }}
      />

      <NewGroupModal
        isOpen={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
        onGroupCreated={() => {
          window.location.reload();
        }}
      />

      <JoinGroupModal
        isOpen={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
