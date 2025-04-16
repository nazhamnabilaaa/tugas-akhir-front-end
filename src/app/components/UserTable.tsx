import React from "react";
import { User } from "@/types/user";
import { TbTrash } from "react-icons/tb";

interface UserTableProps {
  users: User[];
  onDelete: (uuid: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete }) => {
  return (
    <table className="min-w-full bg-white border-collapse border-gray-300 border">
      <thead className="border">
        <tr className="border">
          <th className="border border-gray-300 px-6 py-4 text-center">Nama Lengkap</th>
          <th className="border border-gray-300 px-6 py-4 text-center">NIP</th>
          <th className="border border-gray-300 px-6 py-4 text-center">
            Username
          </th>
          <th className="border border-gray-300 px-6 py-4 text-center">
            No Telepon
          </th>
          <th className="border border-gray-300 px-6 py-4 text-center">
            Alamat
          </th>
          <th className="border border-gray-300 px-6 py-4 text-center">
            Email
          </th>
          <th className="border border-gray-300 px-6 py-4 text-center">
            Jenis Akun
          </th>
          <th className="border border-gray-300 px-6 py-4 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.uuid} className="border">
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.namalengkap}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.nip}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.username}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.notelp}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.alamat}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.email}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              {user.role}
            </td>
            <td className="px-6 border border-gray-300 py-4 text-center">
              <div className="flex justify-center space-x-2">
                <TbTrash
                  className="text-[#E20202] text-lg cursor-pointer"
                  onClick={() => onDelete(user.uuid)}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
