import React, { useEffect, useCallback } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const RESULTS_TOUR_KEY = 'botanicai_results_tour_completed';

interface SearchResultsTourProps {
  hasResults: boolean;
}

export const SearchResultsTour: React.FC<SearchResultsTourProps> = ({ hasResults }) => {
  const startResultsTour = useCallback(() => {
    const filterElement = document.querySelector('#tour-morphology-filter');
    const compoundsElement = document.querySelector('#tour-results-phytochemistry');
    const gaugeElement = document.querySelector('#tour-confidence-gauge');
    const viewPapersElement = document.querySelector('#tour-view-papers');

    if (!filterElement && !compoundsElement) return;

    const steps = [];

    if (filterElement) {
      steps.push({
        element: '#tour-morphology-filter',
        popover: {
          title: '🍃 Plant Tissue & Bioactivity Filters',
          description:
            'Filter mined research by specific plant anatomy (leaves, roots, bark, seeds, flowers) or target bioactivities.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      });
    }

    if (compoundsElement) {
      steps.push({
        element: '#tour-results-phytochemistry',
        popover: {
          title: '🧪 Active Phytochemicals',
          description:
            'Identifies isolated bioactive compounds (e.g., curcumin, quercetin) linked to observed pharmacological data.',
          side: 'top' as const,
          align: 'center' as const,
        },
      });
    }

    if (gaugeElement) {
      steps.push({
        element: '#tour-confidence-gauge',
        popover: {
          title: '🛡️ Evidence Confidence Gauge',
          description:
            'Calculates scientific evidence confidence scores and counts peer-reviewed paper support.',
          side: 'top' as const,
          align: 'center' as const,
        },
      });
    }

    if (viewPapersElement) {
      steps.push({
        element: '#tour-view-papers',
        popover: {
          title: '📄 Scientific Papers & PDF Dossier',
          description:
            'Click View Papers to read full abstracts, sorted DOIs, and save downloadable PDF reports with BotanicAI watermarks.',
          side: 'top' as const,
          align: 'center' as const,
        },
      });
    }

    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'botanicai-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Start Exploring! 🔬',
      steps,
      onDestroyed: () => {
        localStorage.setItem(RESULTS_TOUR_KEY, 'true');
      },
    });

    driverObj.drive();
  }, []);

  // Auto-trigger when search results are returned for the first time
  useEffect(() => {
    if (hasResults) {
      const isCompleted = localStorage.getItem(RESULTS_TOUR_KEY);
      if (!isCompleted) {
        const timer = setTimeout(() => {
          startResultsTour();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [hasResults, startResultsTour]);

  return null;
};
