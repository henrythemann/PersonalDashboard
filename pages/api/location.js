export async function getServerSideProps(context) {
    const res = await fetch('http://ip-api.com/json/' + context.query);
    const data = await res.json();
  
    return {
      props: { data }, // will be passed to the page component as props
    };
  }