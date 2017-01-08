import { ToiletRunPage } from './app.po';

describe('toilet-run App', function() {
  let page: ToiletRunPage;

  beforeEach(() => {
    page = new ToiletRunPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
