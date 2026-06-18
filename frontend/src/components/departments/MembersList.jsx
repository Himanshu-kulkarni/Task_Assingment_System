import { ROLE_LABELS, ROLE_COLORS } from '../../utils/roles';
import { getInitials } from '../../utils/helpers';

const MembersList = ({ members }) => {
  if (!members?.length) {
    return <p className="text-sm text-gray-500 py-4 text-center">No members in this department yet.</p>;
  }

  return (
    <div className="divide-y divide-gray-50">
      {members.map((member) => (
        <div key={member.user_id} className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {getInitials(member.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-600'}`}>
            {ROLE_LABELS[member.role] || member.role}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MembersList;
