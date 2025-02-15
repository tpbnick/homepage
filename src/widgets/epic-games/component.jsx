import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import { useMemo } from "react";

const isCurrentlyFree = (promotions) => {
    const currentOffers = promotions?.promotionalOffers?.[0]?.promotionalOffers || [];
    return currentOffers.some(offer => offer.discountSetting.discountPercentage === 0);
  };

  const isUpcomingFree = (promotions) => {
    const upcomingOffers = promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers || [];
    return upcomingOffers.some(offer => offer.discountSetting.discountPercentage === 0);
  };

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: epicData, error: epicError } = useWidgetAPI(widget, "games");

  const games = useMemo(() => {
    if (!epicData?.data?.Catalog?.searchStore?.elements) return [];

    return epicData.data.Catalog.searchStore.elements
      .filter(game => game.promotions && (isCurrentlyFree(game.promotions) || isUpcomingFree(game.promotions)))
      .map(game => ({
        title: game.title,
        status: isCurrentlyFree(game.promotions) ? t('epic.availableNow') : t('epic.comingSoon')
      }));
  }, [epicData, t]);

  const currentGames = useMemo(() => games.filter(game => game.status === t('epic.availableNow')), [games, t]);
  const upcomingGames = useMemo(() => games.filter(game => game.status === t('epic.comingSoon')), [games, t]);

  if (epicError) {
    return <Container service={service} error={epicError} />;
  }

  if (!epicData) {
    return (
      <Container service={service}>
        <Block label="epic.current" />
        <Block label="epic.upcoming" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block 
        label="epic.current" 
        value={currentGames.length ? currentGames.map(game => game.title).join('\n') : t('epic.none')} 
      />
      <Block 
        label="epic.upcoming" 
        value={upcomingGames.length ? upcomingGames.map(game => game.title).join('\n') : t('epic.none')} 
      />
    </Container>
  );
}