// Activity — friends' rounds, kudos and achievements. Lands with accounts
// (Phase 3); until then this is an honest placeholder, not fake data.
import React from 'react';
import { Screen, Header, Empty } from '../../src/ui';

export default function Activity() {
  return (
    <Screen>
      <Header eyebrow="Your golf buddies" title="Activity" />
      <Empty
        title="Friends' rounds will show up here"
        body="Follow your golf buddies to see their rounds, give kudos and compare scores from days you played together. This arrives with accounts in the next release."
      />
    </Screen>
  );
}
