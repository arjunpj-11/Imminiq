interface IFriendsHeaderProps {
  title: string;
  description: string;
}

export default function FriendsHeader({ title, description }: IFriendsHeaderProps) {
  return <PageHero eyebrow="Learning network" title={title} description={description} compact />;
}
import PageHero from '../../../../../components/layout/PageHero';
