import M3TabBar from "@/app/components/m3/M3TabBar";

type InvitationWorkflowTabsProps = {
  weddingId: string;
  activeStep: 1 | 2;
  dashboardEnabled: boolean;
};

export default function InvitationWorkflowTabs({
  weddingId,
  activeStep,
  dashboardEnabled,
}: InvitationWorkflowTabsProps) {
  return (
    <M3TabBar
      aria-label="Invitation workflow"
      items={[
        {
          id: "invitation",
          label: "Invitation",
          href: `/admin/edit/${weddingId}`,
          active: activeStep === 1,
        },
        {
          id: "dashboard",
          label: "Guests & RSVPs",
          href: dashboardEnabled ? `/dashboard/${weddingId}` : undefined,
          active: activeStep === 2,
          disabled: !dashboardEnabled,
          title: dashboardEnabled ? undefined : "Finish invitation details to unlock the dashboard.",
        },
      ]}
    />
  );
}
