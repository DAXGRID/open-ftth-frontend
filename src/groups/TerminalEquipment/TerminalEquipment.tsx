import { ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

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
      <div
        className="terminal-equipment-header
        terminal-equipment-table-row
        terminal-equipment-table-grid"
      >
        <div className="terminal-equipment-table-item">A-Info</div>
        <div className="terminal-equipment-table-item">From</div>
        <div className="terminal-equipment-table-item">Pin/Port</div>
        <div className="terminal-equipment-table-item">To</div>
        <div className="terminal-equipment-table-item">Z-Info</div>
      </div>
      <div className="terminal-equipment-table-body">
        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-header-row">
            <p className="terminal-equipment-row-header__item">1</p>
            <p className="terminal-equipment-row-header__item">
              12 soems bred splidsebakke
            </p>
            <p className="terminal-equipment-row-header__item">
              (1 af 12 pladser brugt)
            </p>
          </div>
        </div>

        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-data-row terminal-equipment-table-grid">
            <div className="terminal-equipment-table-item">
              <span className="terminal-equipment-table-item__icon">
                <FontAwesomeIcon icon={faChevronRight} />
              </span>
              <span>GALAH-ODF 1-3-1 WDM 1-4-1 OLT-1-1-1</span>
            </div>
            <div className="terminal-equipment-table-item">
              K102034 (72) Fiber 1
            </div>
            <div className="terminal-equipment-table-item">1 -O-</div>
            <div className="terminal-equipment-table-item">
              Splitter 1 (1:32) Ind 1
            </div>
            <div className="terminal-equipment-table-item">
              Total 29 installations. 3 free ports
            </div>
          </div>
        </div>

        <div className="terminal-equipment-table-row">
          <div className="terminal-equipment-data-row terminal-equipment-table-grid">
            <div className="terminal-equipment-table-item">
              <span className="terminal-equipment-table-item__icon">
                <FontAwesomeIcon icon={faChevronDown} />
              </span>
              <span>GALAH-ODF 1-3-1 WDM 1-4-1 OLT-1-1-1</span>
            </div>
            <div className="terminal-equipment-table-item">
              K102034 (72) Fiber 1
            </div>
            <div className="terminal-equipment-table-item">2 -O-</div>
            <div className="terminal-equipment-table-item">
              Splitter 1 (1:32) Ind 1
            </div>
            <div className="terminal-equipment-table-item">
              Total 29 installations. 3 free ports
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalEquipment() {
  return (
    <div>
      <TableContainer
        headerTexts={["Rack position: 3", "Type: Comspec FIST-GSS2"]}
      >
        <ReadonlyTable />
      </TableContainer>
    </div>
  );
}

export default TerminalEquipment;
