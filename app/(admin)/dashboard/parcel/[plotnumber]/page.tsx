import React from 'react';

const page = async ({
  params,
}: {
  params: Promise<{ plotnumber: string }>;
}) => {
  const { plotnumber } = await params;

  return (
    <div>
      <p>I am number {plotnumber}</p>
    </div>
  );
};

export default page;
