import { TopicPage } from '../../components/public/TopicPage';
import { topics } from '../../lib/public-content';
import { pageMetadata } from '../../lib/seo';
const topic=topics['intraday-trading-journal'];
export const metadata=pageMetadata(topic.title,topic.description,'/intraday-trading-journal');
export default function Page(){return <TopicPage slug="intraday-trading-journal" />;}

