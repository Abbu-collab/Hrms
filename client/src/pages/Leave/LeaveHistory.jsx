import LeaveCard from "../../components/Leave/LeaveCard";
import { FiClock, FiInbox } from "react-icons/fi";

/**
 * LeaveHistory — displays a list of leave records as cards.
 *
 * Props:
 *   leaves         — array of leave objects
 *   refreshLeaves  — callback to reload the list
 *   currentUserId  — the authenticated user's ID, forwarded to LeaveCard
 *                    for the cancel-ownership check
 */
export default function LeaveHistory({ leaves = [], refreshLeaves, currentUserId }) {
  const leaveList = Array.isArray(leaves) ? leaves : [];

  return (
    <div className="leave-history-container">
      <div className="leave-sub-header">
        <h2 className="leave-sub-title">
          <FiClock size={18} /> My Leave History
        </h2>
        <p className="leave-sub-subtitle">Your past and pending leave applications.</p>
      </div>

      {leaveList.length === 0 ? (
        <div className="leave-empty-state">
          <div className="leave-empty-icon">
            <FiInbox size={36} />
          </div>
          <h3>No leave records found</h3>
          <p>You have not applied for any leave yet. Use the form above to submit a request.</p>
        </div>
      ) : (
        <div className="leave-history-list">
          {leaveList.map((leave) => (
            <LeaveCard
              key={leave._id}
              leave={leave}
              refreshLeaves={refreshLeaves}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}