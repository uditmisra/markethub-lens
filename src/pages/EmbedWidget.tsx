import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TestimonialWidget from "@/components/widgets/TestimonialWidget";

const EmbedWidget = () => {
  const [searchParams] = useSearchParams();

  const config = {
    theme: (searchParams.get('theme') as 'light' | 'dark') || 'light',
    layout: (searchParams.get('layout') as 'grid' | 'carousel' | 'list') || 'grid',
    maxItems: parseInt(searchParams.get('maxItems') || '6'),
    product: searchParams.get('product') || undefined,
    showRating: searchParams.get('showRating') !== 'false',
    showAvatar: searchParams.get('showAvatar') !== 'false',
  };

  useEffect(() => {
    // Remove any default margins/padding for iframe embedding
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return <TestimonialWidget config={config} />;
};

export default EmbedWidget;
