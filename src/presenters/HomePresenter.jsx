import { useState, useMemo } from "react";
import HomeView from "../views/HomeView";

// Presenter for HomeView: derives data and manages UI-only state
function HomePresenter({
  onGetStarted,
  onReset,
  clickCount,
  loading,
  user,
  onLogout,
  wikipediaData,
  wikipediaLoading,
  wikipediaError,
}) {
  const [showFullText, setShowFullText] = useState(false);

  const { summary, contentText, contentSections } = useMemo(() => {
    return {
      summary: wikipediaData?.summary || null,
      contentText: wikipediaData?.contentText || null,
      contentSections: wikipediaData?.contentSections || null,
    };
  }, [wikipediaData]);

  const handleToggleFullText = () => setShowFullText((s) => !s);

  return (
    <HomeView
      onGetStarted={onGetStarted}
      onReset={onReset}
      clickCount={clickCount}
      loading={loading}
      user={user}
      onLogout={onLogout}
      wikipediaSummary={summary}
      wikipediaContentText={contentText}
      wikipediaSections={contentSections}
      wikipediaLoading={wikipediaLoading}
      wikipediaError={wikipediaError}
      showFullText={showFullText}
      onToggleFullText={handleToggleFullText}
    />
  );
}

export default HomePresenter;
