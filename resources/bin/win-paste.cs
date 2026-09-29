using System;
using System.IO;
using System.Collections.Specialized;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using System.Windows.Automation;
using System.Windows.Automation.Text;

class Program {
    [DllImport("user32.dll")]
    static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

    [DllImport("user32.dll")]
    static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    [DllImport("kernel32.dll")]
    static extern uint GetCurrentThreadId();

    [DllImport("user32.dll")]
    static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool GetGUIThreadInfo(uint idThread, ref GUITHREADINFO lpgui);

    [DllImport("user32.dll")]
    static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);

    [DllImport("user32.dll")]
    static extern bool SetProcessDPIAware();

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool SetProcessDpiAwarenessContext(IntPtr dpiContext);

    [StructLayout(LayoutKind.Sequential)]
    struct POINT { public int X; public int Y; }

    [StructLayout(LayoutKind.Sequential)]
    struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    struct GUITHREADINFO {
        public int cbSize;
        public int flags;
        public IntPtr hwndActive;
        public IntPtr hwndFocus;
        public IntPtr hwndCapture;
        public IntPtr hwndMenuOwner;
        public IntPtr hwndMoveSize;
        public IntPtr hwndCaret;
        public RECT rcCaret;
    }

    const int KEYEVENTF_KEYUP = 0x0002;
    const byte VK_LWIN = 0x5B, VK_RWIN = 0x5C, VK_CONTROL = 0x11, VK_V = 0x56, VK_SHIFT = 0x10, VK_MENU = 0x12;

    static void EnableDpiAwareness() {
        try {
            if (!SetProcessDpiAwarenessContext(new IntPtr(-4))) SetProcessDPIAware();
        } catch {
            try { SetProcessDPIAware(); } catch {}
        }
    }

    [STAThread]
    static void Main(string[] args) {
        if (args.Length > 0 && args[0] == "get-target") {
            OutputTargetContext();
            return;
        }

        long targetHwndVal = 0;
        string filePath = null, text = null;

        for (int i = 0; i < args.Length; i++) {
            if (args[i] == "--hwnd" && i + 1 < args.Length) {
                long.TryParse(args[i + 1], out targetHwndVal);
                i++;
            } else if (args[i] == "--file" && i + 1 < args.Length) {
                filePath = args[i + 1];
                i++;
            } else if (args[i] == "--text" && i + 1 < args.Length) {
                text = args[i + 1];
                i++;
            }
        }

        // 1. Set multi-format clipboard
        if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath)) {
            try {
                DataObject dataObj = new DataObject();
                StringCollection files = new StringCollection();
                files.Add(filePath);
                dataObj.SetFileDropList(files);
                dataObj.SetText(!string.IsNullOrEmpty(text) ? text : Path.GetFileName(filePath));
                try {
                    using (Image img = Image.FromFile(filePath)) {
                        dataObj.SetImage(new Bitmap(img));
                    }
                } catch {}
                Clipboard.SetDataObject(dataObj, true);
            } catch (Exception ex) {
                Console.Error.WriteLine("Clipboard error: " + ex.Message);
            }
        }

        // 2. Restore foreground window with AttachThreadInput
        if (targetHwndVal != 0) {
            IntPtr targetHwnd = new IntPtr(targetHwndVal);
            uint targetThread = GetWindowThreadProcessId(targetHwnd, IntPtr.Zero);
            uint currentThread = GetCurrentThreadId();

            if (targetThread != 0 && targetThread != currentThread) {
                AttachThreadInput(currentThread, targetThread, true);
            }
            SetForegroundWindow(targetHwnd);
            Thread.Sleep(80);
            if (targetThread != 0 && targetThread != currentThread) {
                AttachThreadInput(currentThread, targetThread, false);
            }
        }

        // 3. Clear stuck modifier keys & send Ctrl+V
        keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_RWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(30);

        keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_V, 0, 0, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_V, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        Thread.Sleep(15);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);

        Console.WriteLine("SUCCESS");
    }

    static void OutputTargetContext() {
        EnableDpiAwareness();
        long hwndVal = 0;
        int targetX = 0, targetY = 0;
        bool found = false;

        try {
            IntPtr fg = GetForegroundWindow();
            hwndVal = fg.ToInt64();

            uint fgThread = GetWindowThreadProcessId(fg, IntPtr.Zero);
            if (fgThread != 0) {
                GUITHREADINFO gui = new GUITHREADINFO();
                gui.cbSize = Marshal.SizeOf(gui);
                if (GetGUIThreadInfo(fgThread, ref gui) && gui.hwndCaret != IntPtr.Zero) {
                    POINT caretPt = new POINT { X = gui.rcCaret.Left, Y = gui.rcCaret.Bottom };
                    if (ClientToScreen(gui.hwndCaret, ref caretPt)) {
                        targetX = caretPt.X;
                        targetY = caretPt.Y;
                        found = true;
                    }
                }
            }

            if (!found) {
                AutomationElement focused = AutomationElement.FocusedElement;
                if (focused != null) {
                    if (focused.Current.NativeWindowHandle != 0) {
                        hwndVal = focused.Current.NativeWindowHandle;
                    }
                    object patternObj;
                    if (focused.TryGetCurrentPattern(TextPattern.Pattern, out patternObj)) {
                        TextPattern textPattern = (TextPattern)patternObj;
                        TextPatternRange[] ranges = textPattern.GetSelection();
                        if (ranges != null && ranges.Length > 0) {
                            System.Windows.Rect[] rects = ranges[0].GetBoundingRectangles();
                            if (rects != null && rects.Length > 0 && !double.IsInfinity(rects[0].Left) && !double.IsNaN(rects[0].Left)) {
                                targetX = (int)rects[0].Left;
                                targetY = (int)rects[0].Bottom;
                                found = true;
                            }
                        }
                    }
                    if (!found) {
                        System.Windows.Rect bounds = focused.Current.BoundingRectangle;
                        if (!double.IsInfinity(bounds.Left) && !double.IsNaN(bounds.Left) && bounds.Width > 0 && bounds.Height > 0) {
                            targetX = (int)bounds.Left;
                            targetY = (int)bounds.Bottom;
                            found = true;
                        }
                    }
                }
            }
        } catch {}

        if (!found) {
            POINT pt;
            if (GetCursorPos(out pt)) {
                targetX = pt.X;
                targetY = pt.Y;
                found = true;
            }
        }

        Console.WriteLine(string.Format("HWND={0}", hwndVal));
        if (found) {
            Console.WriteLine(string.Format("CARET_X={0}", targetX));
            Console.WriteLine(string.Format("CARET_Y={0}", targetY));
        }
    }
}
