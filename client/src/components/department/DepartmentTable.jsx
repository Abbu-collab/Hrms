import { FiEdit2, FiTrash2 } from "react-icons/fi";

function StatusBadge({ status }) {
    return (
        <span
            className={`badge ${status === "Active" ? "active" : "inactive"
                }`}
        >
            {status}
        </span>
    );
}

export default function DepartmentTable({
    departments = [],
    loading = false,
    onEdit,
    onDelete,
}) {
    if (loading) {
        return (
            <div className="table-loading">
                Loading departments...
            </div>
        );
    }

    if (departments.length === 0) {
        return (
            <div className="table-empty">
                No departments found.
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th>Department ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th width="130">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {departments.map((dept) => (
                        <tr key={dept._id}>
                            <td>{dept.departmentId}</td>

                            <td>{dept.departmentName}</td>

                            <td>{dept.description || "-"}</td>

                            <td>{dept.location || "-"}</td>

                            <td>
                                <StatusBadge status={dept.status} />
                            </td>

                            <td>
                                <button
                                    className="btn-edit"
                                    onClick={() => onEdit(dept)}
                                >
                                    <FiEdit2 />
                                </button>

                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(dept._id)}
                                >
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}