import React from 'react';
import { Link } from 'expo-router';
import { Screen, Pad, H2, Muted } from '../src/ui';

export default function NotFound() {
  return (
    <Screen>
      <Pad>
        <H2>That page doesn't exist.</H2>
        <Muted style={{ marginTop: 6 }}>It may have been moved.</Muted>
        <Link href="/" style={{ marginTop: 18 }}>Back to Home</Link>
      </Pad>
    </Screen>
  );
}
