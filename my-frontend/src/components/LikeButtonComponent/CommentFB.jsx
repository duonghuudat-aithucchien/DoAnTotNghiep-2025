import React, { useEffect } from 'react';

const CommentFB = ({ dataHref, width }) => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div style={{ margin: '-10px -12px 0' }}>
      <div
        className="fb-comments"
        data-href={dataHref}
        data-width={width}
        data-numposts="5"
      ></div>
    </div>
  );
};

export default CommentFB;
