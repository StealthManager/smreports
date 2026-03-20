import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { LeadQualitySection } from "@/components/dashboard/LeadQualitySection";
import { AdPerformanceSection } from "@/components/dashboard/AdPerformanceSection";
import { MaterialApprovalSection } from "@/components/dashboard/MaterialApprovalSection";
import { IntegrationsSection } from "@/components/dashboard/IntegrationsSection";
import { TeamSection } from "@/components/dashboard/TeamSection";

type Section = "overview" | "leads" | "ads" | "materials" | "integrations" | "team";

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection />;
      case "leads": return <LeadQualitySection />;
      case "ads": return <AdPerformanceSection />;
      case "materials": return <MaterialApprovalSection />;
      case "integrations": return <IntegrationsSection />;
      case "team": return <TeamSection />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
