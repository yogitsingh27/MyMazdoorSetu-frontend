import { Routes, Route, Navigate, useParams } from 'react-router-dom';

import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import RequireAuth from '@/router/RequireAuth';
import RoleRoute from '@/router/RoleRoute';

import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { ROLE } from '@/types/roles';
import { PAGE_TITLES } from '@/config/dashboards';

import { PageHead } from '@/components/common/Primitives';
import EmptyState from '@/components/common/EmptyState';

// Public
import Landing from '@/pages/public/Landing';
import JobsBrowse from '@/pages/public/JobsBrowse';
import JobDetail from '@/pages/public/JobDetail';
import WorkersBrowse from '@/pages/public/WorkersBrowse';
import WorkerDetail from '@/pages/public/WorkerDetail';
import ProjectsBrowse from '@/pages/public/ProjectsBrowse';
// Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import RoleSelectPage from '@/pages/auth/RoleSelectPage';
// Shared
import DashboardHome from '@/pages/shared/DashboardHome';
import MessagesPage from '@/pages/shared/MessagesPage';
import GrievancePage from '@/pages/shared/GrievancePage';
import NotFound from '@/pages/shared/NotFound';
// Worker
import { BrowseJobsPage, MyApplicationsPage } from '@/pages/worker/WorkerPages';
import WorkerProfile from '@/pages/worker/WorkerProfile';
// Contractor
import { ContractorJobsPage, ApplicantsPage, ManagedWorkersPage } from '@/pages/contractor/ContractorPages';
import ContractorProfile from '@/pages/contractor/ContractorProfile';
// Employer
import { FindWorkersPage, EmployerJobsPage, EmployerApplicationsPage, SavedWorkersPage } from '@/pages/employer/EmployerPages';
import EmployerProfile from '@/pages/employer/EmployerProfile';
// Agent
import { RegisteredWorkersPage, RegisteredContractorsPage, CommissionPage } from '@/pages/agent/AgentPages';
import AgentProfile from '@/pages/agent/AgentProfile';
// Admin
import { AdminUsersPage, AdminJobsPage, VerificationQueuePage, ActivityLogsPage } from '@/pages/admin/AdminPages';
import AdminProfile from '@/pages/admin/AdminProfile';

/* ------------------------------------------------------------------ *
 * Placeholder for nav sections that are wired but built in a later
 * phase (e.g. Payments). The link works and the chrome is correct;
 * the screen itself sits on top of the existing services when built.
 * ------------------------------------------------------------------ */
function Soon({ pageKey }) {
  const [title, desc] = PAGE_TITLES[pageKey] || [pageKey, ''];
  return (
    <div>
      <PageHead title={title} desc={desc} />
      <EmptyState
        icon="cog"
        title={`${title} is coming in a later phase`}
        hint="Navigation and architecture are wired — this screen will be built on top of the existing services."
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Role dispatchers — a few nav keys resolve to different components
 * depending on the active role (the URL :role param). These keep the
 * route table declarative while honoring per-role differences.
 * ------------------------------------------------------------------ */
function OverviewRoute() {
  const { role } = useParams();
  return <DashboardHome role={role} />;
}

function ApplicationsRoute() {
  const { role } = useParams();
  if (role === ROLE.WORKER) return <MyApplicationsPage />;
  if (role === ROLE.EMPLOYER) return <EmployerApplicationsPage />;
  return <Soon pageKey="applications" />; // agent
}

function JobsRoute() {
  const { role } = useParams();
  if (role === ROLE.ADMIN) return <AdminJobsPage />;
  return <ContractorJobsPage />; // contractor "My jobs"
}

function PostRoute() {
  const { role } = useParams();
  // Posting happens on each role's jobs page via the modal.
  return role === ROLE.EMPLOYER ? <EmployerJobsPage /> : <ContractorJobsPage />;
}

function GrievanceRoute() {
  const { role } = useParams();
  return <GrievancePage role={role} />;
}

function ProfileRoute() {
  const { role } = useParams();
  switch (role) {
    case ROLE.WORKER: return <WorkerProfile />;
    case ROLE.CONTRACTOR: return <ContractorProfile />;
    case ROLE.EMPLOYER: return <EmployerProfile />;
    case ROLE.AGENT: return <AgentProfile />;
    case ROLE.ADMIN: return <AdminProfile />;
    default: return <NotFound />;
  }
}

/* /app with no role → send the user to the right place. */
function AppIndex() {
  const { user, isAuthenticated } = useAuth();
  const { activeRole } = useRole();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.roles.length > 1 && !activeRole) return <Navigate to="/select-role" replace />;
  return <Navigate to={`/app/${activeRole || user.roles[0]}`} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<Landing />} />
        <Route path="/jobs" element={<JobsBrowse />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/workers" element={<WorkersBrowse />} />
        <Route path="/workers/:id" element={<WorkerDetail />} />
        <Route path="/projects" element={<ProjectsBrowse />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated, pre-dashboard */}
      <Route element={<RequireAuth />}>
        <Route path="/select-role" element={<RoleSelectPage />} />
      </Route>

      {/* Dashboard — role-guarded. /app resolves to the active role. */}
      <Route path="/app" element={<AppIndex />} />
      <Route path="/app/:role" element={<RoleRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />

          {/* shared / dispatched */}
          <Route path="overview" element={<OverviewRoute />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="grievance" element={<GrievanceRoute />} />
          <Route path="profile" element={<ProfileRoute />} />
          <Route path="applications" element={<ApplicationsRoute />} />
          <Route path="jobs" element={<JobsRoute />} />
          <Route path="post" element={<PostRoute />} />
          <Route path="payments" element={<Soon pageKey="payments" />} />

          {/* worker */}
          <Route path="browse" element={<BrowseJobsPage />} />

          {/* contractor */}
          <Route path="applicants" element={<ApplicantsPage />} />
          <Route path="workers" element={<ManagedWorkersPage />} />

          {/* employer */}
          <Route path="search" element={<FindWorkersPage />} />
          <Route path="myjobs" element={<EmployerJobsPage />} />
          <Route path="saved" element={<SavedWorkersPage />} />

          {/* agent */}
          <Route path="registered" element={<RegisteredWorkersPage />} />
          <Route path="contractors" element={<RegisteredContractorsPage />} />
          <Route path="commission" element={<CommissionPage />} />

          {/* admin */}
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="verification" element={<VerificationQueuePage />} />
          <Route path="logs" element={<ActivityLogsPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
