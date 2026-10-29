
import React, { useState } from "react";
import { Circles } from "react-loader-spinner";

type LoadingProps = {
  isLoading: boolean;
  setLoading: (isComponentLoading: boolean) => void;
};

const Loading: React.FC = () => {
  return (
    <div className="loaderHolder">
      <div className="loaderMain">
        <Circles
          height="80"
          width="80"
          color="#ffffff"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          visible={true}
        />
      </div>
    </div>
  );
};

const IsLoadingHOC = <P extends object>(
  WrappedComponent: React.ComponentType<P & LoadingProps>
) => {
  const HOC: React.FC<P> = (props) => {
    const [isLoading, setLoading] = useState<boolean>(false);

    const setLoadingState = (isComponentLoading: boolean) => {
      setLoading(isComponentLoading);
    };

    return (
      <>
        {isLoading && <Loading />}
        <WrappedComponent
          {...props}
          isLoading={isLoading}
          setLoading={setLoadingState}
        />
      </>
    );
  };

  return HOC;
};

export default IsLoadingHOC;
