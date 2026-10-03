import { Link } from 'react-router';
import { Book, Page } from '../components/Book';
import { Ornament } from '../components/Bits';

export default function NotFoundPage() {
  return (
    <Book>
      <Page side="left">
        <div className="page__placeholder">
          <p className="eyebrow">Missing page</p>
          <h1 className="display">This page has been torn out.</h1>
        </div>
      </Page>
      <Page side="right">
        <div className="page__placeholder">
          <Ornament />
          <p>The address you followed doesn’t match any page in the book.</p>
          <Link className="btn btn--primary" to="/contents">
            Go to contents
          </Link>
        </div>
      </Page>
    </Book>
  );
}
