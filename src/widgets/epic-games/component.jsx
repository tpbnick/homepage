import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: epicData, error: epicError } = useWidgetAPI(widget, "games");

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

  const games = epicData.data.Catalog.searchStore.elements
    .filter(game => {
      const { promotions } = game;
      if (!promotions) return false;
      
      // Check if game has current or upcoming free offers
      const hasCurrentFreeOffer = promotions.promotionalOffers?.some(offer =>
        offer.promotionalOffers?.some(promo => 
          promo.discountSetting.discountPercentage === 0 &&
          new Date(promo.startDate) <= new Date() &&
          new Date(promo.endDate) > new Date()
        )
      );

      const hasUpcomingFreeOffer = promotions.upcomingPromotionalOffers?.some(offer =>
        offer.promotionalOffers?.some(promo => 
          promo.discountSetting.discountPercentage === 0
        )
      );

      return hasCurrentFreeOffer || hasUpcomingFreeOffer;
    })
    .map(game => ({
      title: game.title,
      status: game.promotions.promotionalOffers?.some(offer =>
        offer.promotionalOffers?.some(promo => 
          promo.discountSetting.discountPercentage === 0 &&
          new Date(promo.startDate) <= new Date() &&
          new Date(promo.endDate) > new Date()
        )
      ) ? 'Available Now' : 'Coming Soon'
    }));

  const currentGames = games.filter(game => game.status === 'Available Now');
  const upcomingGames = games.filter(game => game.status === 'Coming Soon');

  return (
    <Container service={service}>
      <Block 
        label="epic.current" 
        value={currentGames.map(game => game.title).join(', ') || t('epic.none')} 
      />
      <Block 
        label="epic.upcoming" 
        value={upcomingGames.map(game => game.title).join(', ') || t('epic.none')} 
      />
    </Container>
  );
}