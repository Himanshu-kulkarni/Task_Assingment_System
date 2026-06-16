from enum import Enum

class UserRole(str, Enum):
    PRESIDENT = "PRESIDENT"
    VICE_PRESIDENT = "VICE_PRESIDENT"
    DEPARTMENT_LEAD = "DEPARTMENT_LEAD"
    MEMBER = "MEMBER"