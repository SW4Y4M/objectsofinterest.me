import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioActionState } from "@/app/studio/actionState";
import { archiveObjectWithState } from "@/app/studio/actions";
import { ArchiveObjectControl } from "@/components/studio/ArchiveObjectControl";
import { mockWishlistObjects } from "@/lib/mock/mockObjects";

const useActionStateMock = vi.hoisted(() => vi.fn());
const formActionSpy = vi.hoisted(() => vi.fn());

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useActionState: useActionStateMock
  };
});

vi.mock("@/app/studio/actions", () => ({
  archiveObjectWithState: vi.fn()
}));

const visibleObject = mockWishlistObjects[0];
const archivedObject = {
  ...mockWishlistObjects[1],
  status: "Archived" as const
};

describe("ArchiveObjectControl", () => {
  beforeEach(() => {
    formActionSpy.mockReset();
    useActionStateMock.mockImplementation((_action, initialState) => [initialState, formActionSpy, false]);
  });

  it("does not submit on the first archive click", async () => {
    const user = userEvent.setup();
    render(<ArchiveObjectControl object={visibleObject} />);

    await user.click(screen.getByRole("button", { name: "Archive Brass oil burner" }));

    expect(formActionSpy).not.toHaveBeenCalled();
  });

  it("initializes action state with the archive action", () => {
    render(<ArchiveObjectControl object={visibleObject} />);

    expect(useActionStateMock).toHaveBeenCalledWith(
      archiveObjectWithState,
      expect.objectContaining({ status: "idle" })
    );
  });

  it("shows confirm archive after the first archive click", async () => {
    const user = userEvent.setup();
    render(<ArchiveObjectControl object={visibleObject} />);

    await user.click(screen.getByRole("button", { name: "Archive Brass oil burner" }));

    expect(screen.getByRole("button", { name: "Confirm archive Brass oil burner" })).toBeInTheDocument();
  });

  it("hides confirmation when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<ArchiveObjectControl object={visibleObject} />);

    await user.click(screen.getByRole("button", { name: "Archive Brass oil burner" }));
    await user.click(screen.getByRole("button", { name: "Cancel archive Brass oil burner" }));

    expect(screen.queryByRole("button", { name: "Confirm archive Brass oil burner" })).not.toBeInTheDocument();
  });

  it("submits the visible object id through the form action", async () => {
    const user = userEvent.setup();
    render(<ArchiveObjectControl object={visibleObject} />);

    await user.click(screen.getByRole("button", { name: "Archive Brass oil burner" }));
    const confirmButton = screen.getByRole("button", { name: "Confirm archive Brass oil burner" });
    const form = confirmButton.closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(formActionSpy).toHaveBeenCalledTimes(1);
    const submittedFormData = formActionSpy.mock.calls[0][0];
    expect(submittedFormData).toBeInstanceOf(FormData);
    expect(submittedFormData.get("id")).toBe(visibleObject.id);
  });

  it("does not render destructive controls for archived objects", () => {
    render(<ArchiveObjectControl object={archivedObject} />);

    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /archive/i })).not.toBeInTheDocument();
  });

  it("renders archive feedback after success", () => {
    const archivedState: StudioActionState = {
      status: "success",
      message: "Object archived.",
      fieldErrors: {}
    };
    useActionStateMock.mockImplementation((_action, _initialState) => [archivedState, formActionSpy, false]);

    render(<ArchiveObjectControl object={visibleObject} />);

    expect(screen.getByRole("status")).toHaveTextContent("Object archived.");
  });
});
