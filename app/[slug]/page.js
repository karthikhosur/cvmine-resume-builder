// app/[slug]/page.js
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EditDocument from '../page'; // Import your main page component

export default function CatchAllRoute() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fullPath = params.slug;
    if (fullPath && fullPath.includes('&data=')) {
      const [_, encodedData] = fullPath.split('&data=');
      if (encodedData) {
        const decodedData = decodeURIComponent(encodedData);
        // Redirect to the home page with the data as a query parameter
        router.replace(`/?data=${encodeURIComponent(decodedData)}`);
      }
    }
  }, [params, router]);

  return <EditDocument />;
}