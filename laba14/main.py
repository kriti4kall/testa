from pathlib import Path
from datetime import datetime
import json
import sys

variant = 11
fio = "Tiskovich Yan Yurevich"
group = "477"
films = [
    "Avatar",
    "Alhimik",
    "Nachalo",
    "Interstellar",
    "Ono2"
]

def task_one():
    print("\n[ task 1 ]")
    fname = Path(f"student_{variant}.txt")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines = []
    lines.append("Student: " + fio)
    lines.append("Group: " + group)
    lines.append("Variant: " + str(variant))
    lines.append("Date: " + now_str)
    lines.append("Favorite films:")
    for idx, film in enumerate(films, 1):
        lines.append(str(idx) + ". " + film)

    count = len(lines)
    lines.append("")
    lines.append("Total records: " + str(count))

    content = "\n".join(lines)

    fname.write_text(content, encoding="utf-8")
    print("created: " + str(fname))

    print("content:")
    print("-" * 30)
    print(fname.read_text(encoding="utf-8"))
    print("-" * 30)


def print_tree(folder, prefix=""):
    folder = Path(folder)
    if not folder.exists():
        return
    items = sorted(folder.iterdir(), key=lambda x: (not x.is_dir(), x.name))
    for item in items:
        if item.is_dir():
            print(prefix + "+ " + item.name + "/")
            print_tree(item, prefix + "  ")
        else:
            print(prefix + "- " + item.name)


def remove_dir(folder):
    folder = Path(folder)
    if folder.is_dir():
        for child in folder.iterdir():
            remove_dir(child)
        folder.rmdir()
    else:
        folder.unlink()


def task_two():
    print("\n[ task 2 ]")
    root = Path("project_" + str(variant))

    dirs_to_make = [
        root / "src" / "modules",
        root / "src" / "components",
        root / "src" / "utils",
        root / "data" / "input",
        root / "data" / "output",
        root / "data" / "temp",
        root / "temp"
    ]

    if variant % 2 != 0:
        dirs_to_make.append(root / "src" / "components" / "1")
        dirs_to_make.append(root / "src" / "components" / "2")
        dirs_to_make.append(root / "src" / "components" / "3")

    for d in dirs_to_make:
        d.mkdir(parents=True, exist_ok=True)
        info_file = d / "info.txt"
        info_file.write_text(
            "Folder: " + d.name + ". Purpose: data storage.",
            encoding="utf-8"
        )

    print("folders created")
    print("\nfirst tree:")
    print_tree(root)

    old_temp = root / "temp"
    new_temp = root / "data" / "temp"
    old_temp.rename(new_temp)
    print("\ntemp moved to data/")

    old_out = root / "data" / "output"
    new_out = root / "data" / "results"
    old_out.rename(new_out)
    print("output renamed to results")

    remove_dir(new_temp)
    print("data/temp removed")

    print("\nsecond tree:")
    print_tree(root)


class Stats:
    def __init__(self):
        self.dir_count = 0
        self.file_count = 0
        self.total_size = 0
        self.by_ext = {}
        self.file_sizes = {}

    def add_dir(self):
        self.dir_count += 1

    def add_file(self, path, size):
        self.file_count += 1
        self.total_size += size
        self.file_sizes[str(path)] = size

        ext = path.suffix.lower()
        if ext == "":
            ext = "no_ext"
        if ext not in self.by_ext:
            self.by_ext[ext] = []
        self.by_ext[ext].append(path.name)


allowed_exts = [".js", ".json", ".txt", ".md"]

def is_ok(path):
    ext = path.suffix.lower()
    return ext in allowed_exts


def scan_dir(folder, stats):
    folder = Path(folder)
    if not folder.exists():
        return
    try:
        for item in folder.iterdir():
            if item.is_dir():
                stats.add_dir()
                scan_dir(item, stats)
            else:
                if not is_ok(item):
                    continue
                size = item.stat().st_size
                if size > 10 * 1024 * 1024:
                    continue
                stats.add_file(item, size)
    except PermissionError:
        pass


def task_three(target="."):
    print("\n[ task 3 ]")
    print("scanning: " + str(target))

    s = Stats()
    scan_dir(target, s)

    print("dirs: " + str(s.dir_count))
    print("files: " + str(s.file_count))

    kb = s.total_size / 1024
    mb = kb / 1024
    print("size: " + str(s.total_size) + " bytes (" + str(round(kb, 2)) + " KB, " + str(round(mb, 2)) + " MB)")

    print("\nextensions (only .js, .json, .txt, .md):")
    for ext in sorted(s.by_ext.keys()):
        lst = s.by_ext[ext]
        print("  " + ext + ": " + str(len(lst)))

    sorted_big = sorted(s.file_sizes.items(), key=lambda x: x[1], reverse=True)

    print("\ntop 5 biggest:")
    n1 = min(5, len(sorted_big))
    for i in range(n1):
        p, sz = sorted_big[i]
        print("  " + str(i + 1) + ". " + Path(p).name + " (" + str(sz) + " bytes)")

    print("\ntop 5 smallest:")
    n2 = min(5, len(sorted_big))
    for i in range(n2):
        p, sz = sorted_big[len(sorted_big) - 1 - i]
        print("  " + str(i + 1) + ". " + Path(p).name + " (" + str(sz) + " bytes)")

    report = {
        "variant": variant,
        "student": fio,
        "dirs": s.dir_count,
        "files": s.file_count,
        "size_bytes": s.total_size,
        "extensions": {}
    }
    for ext in s.by_ext:
        report["extensions"][ext] = len(s.by_ext[ext])

    report_name = "report_" + str(variant) + ".json"
    Path(report_name).write_text(
        json.dumps(report, indent=2),
        encoding="utf-8"
    )
    print("\nreport saved: " + report_name)


if __name__ == "__main__":
    print("lab 14 | variant " + str(variant) + " | " + fio)
    task_one()
    task_two()
    if len(sys.argv) > 1:
        task_three(sys.argv[1])
    else:
        task_three()
    print("\nall done")