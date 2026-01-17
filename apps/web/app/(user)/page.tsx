import { getMessages, getTranslations } from 'next-intl/server';

const HomePage = async () => {
  const t = await getTranslations('HomePage');
  return <div>{t('title')}</div>;
};

export default HomePage;
