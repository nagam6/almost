import { useCallback, useEffect, useRef, useState } from "react";
import "./ConfirmDialog.css";

export function useConfirmDialog() {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((message, confirmLabel = "Continue") => {
    return new Promise((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setRequest({ message, confirmLabel });
    });
  }, []);

  const finish = useCallback((accepted) => {
    resolver.current?.(accepted);
    resolver.current = null;
    setRequest(null);
  }, []);

  useEffect(() => () => { resolver.current?.(false); }, []);

  return {
    confirm,
    dialog: <ConfirmDialog request={request} onChoice={finish} />,
  };
}

function ConfirmDialog({ request, onChoice }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (request && !dialog.open) dialog.showModal();
    if (!request && dialog.open) dialog.close();
  }, [request]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={(event) => {
        event.preventDefault();
        onChoice(false);
      }}
    >
      <p className="confirm-dialog__eyebrow">A moment to check</p>
      <h2 id="confirm-dialog-title">Are you sure?</h2>
      <p id="confirm-dialog-message">{request?.message}</p>
      <div className="confirm-dialog__actions">
        <button type="button" onClick={() => onChoice(false)}>
          Cancel
        </button>
        <button type="button" onClick={() => onChoice(true)}>
          {request?.confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
