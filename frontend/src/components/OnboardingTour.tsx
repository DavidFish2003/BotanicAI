import React, { useEffect, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'botanicai_tour_completed';

interface OnboardingTourProps {
  hasSearchResults?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ hasSearchResults: _hasSearchResults = false }) => {
  const startTour = useCallback(() => {
    // Dynamic element selection based on state (handle edge cases if search hasn't been run yet)
    const morphologyTarget = document.querySelector('#tour-morphology-filter')
      ? '#tour-morphology-filter'
      : '#tour-morphology-filter-fallback';

    const phytochemistryTarget = document.querySelector('#tour-results-phytochemistry')
      ? '#tour-results-phytochemistry'
      : '#tour-phytochemistry-fallback';

    const dbSourcesTarget = document.querySelector('#tour-db-sources')
      ? '#tour-db-sources'
      : '#tour-db-sources-fallback';

    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'botanicai-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Got It! 🌿',
      steps: [
        {
          element: '#tour-search-input',
          popover: {
            title: '🌱 Botanical Search Engine',
            description:
              'Enter any plant scientific name or genus (e.g., Curcuma longa, Ginkgo biloba) to search pharmacological literature across 200M+ research papers.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: dbSourcesTarget,
          popover: {
            title: '📚 6-Database Literature Mining',
            description:
              'BotanicAI simultaneously searches PubMed, OpenAlex, Europe PMC, Semantic Scholar, Crossref, and bioRxiv to extract peer-reviewed evidence in seconds.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: morphologyTarget,
          popover: {
            title: '🍃 Plant Morphology Filtering',
            description:
              'Categorize research by plant anatomy—leaves, roots, bark, seeds, or flowers—to isolate organ-specific biochemical data.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: phytochemistryTarget,
          popover: {
            title: '🧪 Active Phytochemistry',
            description:
              'Isolate specific active compounds (curcumin, quercetin, etc.) paired directly with verified pharmacological mechanisms and PubMed citations.',
            side: 'top',
            align: 'center',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      },
    });

    driverObj.drive();
  }, []);

  // Auto-trigger tour for first-time visitors
  useEffect(() => {
    const isCompleted = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!isCompleted) {
      const timer = setTimeout(() => {
        startTour();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  return (
    <button
      id="tour-trigger-btn"
      type="button"
      onClick={startTour}
      className="tour-retrigger-btn"
      title="Take Guided Onboarding Tour"
    >
      <HelpCircle size={14} style={{ color: '#10b981' }} />
      <span>Guided Tour</span>
    </button>
  );
};
