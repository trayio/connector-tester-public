export const StatusCode = ({status}) => {
    return (
      <button
        className={`http-status ${
          status.code === 200 ? "success-code" : "error-code"
        }`}
      >
        {status.code} - {status.text}
      </button>
    );
}