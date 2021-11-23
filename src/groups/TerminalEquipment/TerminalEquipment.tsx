import { ReactNode } from "react";

type TableContainerProps = {
  children: ReactNode;
  headerTexts?: string[];
};

function TableContainer({ children, headerTexts }: TableContainerProps) {
  return (
    <div className="table-container">
      <div className="table-container-header">
        {headerTexts?.map((x) => {
          return <p key={x}>{x}</p>;
        })}
      </div>
      <div className="table-container-body">{children}</div>
    </div>
  );
}

function ReadonlyTable() {
  return (
    <div className="terminal-equipment-table">
      <div className="readonly-table-header terminal-equipment-table-grid">
        <div className="terminal-equipment-table-item">A-Info</div>
        <div className="terminal-equipment-table-item">From</div>
        <div className="terminal-equipment-table-item">Pin/Port</div>
        <div className="terminal-equipment-table-item">To</div>
        <div className="terminal-equipment-table-item">Z-Info</div>
      </div>

      <div className="terminal-equipment-table-body"></div>
    </div>
  );
}

function TerminalEquipment() {
  return (
    <div>
      <TableContainer
        headerTexts={["3 GSS 1", "Comspec FIST-GSS2", "32 bakker"]}
      >
        <ReadonlyTable />
      </TableContainer>
    </div>
  );
}

export default TerminalEquipment;
