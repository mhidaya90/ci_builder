import React, { useEffect, useState } from 'react';

export const BitrisePage = () => {
  const [builds, setBuilds] = useState([]);

  useEffect(() => {
    const fetchBuilds = async () => {
      const res = await fetch('/api/proxy/bitrise/apps/YOUR_APP_SLUG/builds');
      const json = await res.json();
      setBuilds(json.data);
    };
    fetchBuilds();
  }, []);

  return (
    <div>
      <h2>Bitrise Builds</h2>
      <ul>
        {builds.map((build: any) => (
          <li key={build.slug}>
            #{build.build_number} - {build.status_text}
          </li>
        ))}
      </ul>
    </div>
  );
};
