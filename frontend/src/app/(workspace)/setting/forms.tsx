"use client";

import { useActionState } from "react";
import { addDepartment, addUser, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = { status: "idle", message: "" };
const input = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600";
const button = "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50";
const userFields = [
  { name: "username", label: "Tên đăng nhập", type: "text", required: true, min: 2, max: 50 },
  { name: "name", label: "Họ và tên", type: "text", max: 191 },
  { name: "email", label: "Email", type: "email", max: 191 },
  { name: "position", label: "Chức vụ", type: "text", max: 191 },
];

function FormMessage({ state }: { state: SettingsFormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-green-700"}
    >
      {state.message}
    </p>
  );
}

export function DepartmentForm() {
  const [state, submit, pending] = useActionState(addDepartment, initialState);

  return (
    <form action={submit} className="max-w-xl space-y-4">
      <div>
        <label htmlFor="department-name" className="mb-1 block text-sm font-medium">Tên phòng ban</label>
        <input id="department-name" name="name" required maxLength={191} className={input} />
      </div>
      <div>
        <label htmlFor="department-description" className="mb-1 block text-sm font-medium">Mô tả</label>
        <textarea id="department-description" name="description" rows={3} maxLength={191} className={input} />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Đang lưu…" : "Thêm phòng ban"}
      </button>
    </form>
  );
}

export function UserForm({ departments }: { departments: { name: string }[] }) {
  const [state, submit, pending] = useActionState(addUser, initialState);

  return (
    <form action={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {userFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={`new-user-${field.name}`} className="mb-1 block text-sm font-medium">{field.label}</label>
            <input
              id={`new-user-${field.name}`}
              name={field.name}
              type={field.type}
              required={field.required}
              minLength={field.min}
              maxLength={field.max}
              autoComplete="off"
              className={input}
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="new-user-department" className="mb-1 block text-sm font-medium">Phòng ban</label>
          <select id="new-user-department" name="department" defaultValue="" required className={input}>
            <option value="" disabled>Chọn phòng ban</option>
            {departments.map(({ name }) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="new-user-password" className="mb-1 block text-sm font-medium">Mật khẩu</label>
          <input
            id="new-user-password" name="password" type="password" autoComplete="new-password"
            required minLength={8} maxLength={50} aria-describedby="new-user-password-rules" className={input}
          />
        </div>
        <div>
          <label htmlFor="new-user-confirmation" className="mb-1 block text-sm font-medium">Xác nhận mật khẩu</label>
          <input
            id="new-user-confirmation" name="confirmation" type="password" autoComplete="new-password"
            required minLength={8} maxLength={50} className={input}
          />
        </div>
      </div>
      <p id="new-user-password-rules" className="text-sm text-gray-600">
        Mật khẩu từ 8 đến 50 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
      </p>
      <FormMessage state={state} />
      <button type="submit" disabled={pending || !departments.length} className={button}>
        {pending ? "Đang lưu…" : "Thêm người dùng"}
      </button>
    </form>
  );
}
