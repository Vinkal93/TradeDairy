import { TopicPage } from '../../components/public/TopicPage';
import { topics } from '../../lib/public-content';
import { pageMetadata } from '../../lib/seo';
const topic=topics['options-trading-journal'];
export const metadata=pageMetadata(topic.title,topic.description,'/options-trading-journal');
export default function Page(){return <TopicPage slug="options-trading-journal" />;}

