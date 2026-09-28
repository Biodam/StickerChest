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

    [StructLayout(LayoutKind.Sequential)]
    struct POINT { public int X; public int Y; }

    const int KEYEVENTF_KEYUP = 0x0002;
    const byte VK_LWIN = 0x5B;
    const byte VK_RWIN = 0x5C;
    const byte VK_CONTROL = 0x11;
    const byte VK_V = 0x56;
    const byte VK_SHIFT = 0x10;
    const byte VK_MENU = 0x12;

    [STAThread]
    static void Main(string[] args) {
        if (args.Length > 0 && args[0] == "get-target") {
            OutputTargetContext();
            return;
        }

        long targetHwndVal = 0;
        string filePath = null;
        string text = null;

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

                if (!string.IsNullOrEmpty(text)) {
                    dataObj.SetText(text);
                } else {
                    dataObj.SetText(Path.GetFileName(filePath));
                }

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

        // 3. Clear stuck modifier keys
        keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_RWIN, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
        keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);

        Thread.Sleep(30);

        // 4. Send Ctrl+V
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
        long hwndVal = 0;
        int targetX = -1;
        int targetY = -1;

        try {
            IntPtr fg = GetForegroundWindow();
            hwndVal = fg.ToInt64();

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
                        if (rects != null && rects.Length > 0) {
                            targetX = (int)rects[0].Left;
                            targetY = (int)rects[0].Bottom;
                        }
                    }
                }

                if (targetX < 0 || targetY < 0) {
                    System.Windows.Rect bounds = focused.Current.BoundingRectangle;
                    if (bounds.Width > 0 && bounds.Height > 0) {
                        targetX = (int)bounds.Left;
                        targetY = (int)bounds.Bottom;
                    }
                }
            }
        } catch {}

        if (targetX < 0 || targetY < 0) {
            POINT pt;
            GetCursorPos(out pt);
            targetX = pt.X;
            targetY = pt.Y;
        }

        Console.WriteLine(string.Format("HWND={0}", hwndVal));
        Console.WriteLine(string.Format("CARET_X={0}", targetX));
        Console.WriteLine(string.Format("CARET_Y={0}", targetY));
    }
}
