class Solution:
    def simplifyPath(self, path: str) -> str:
        stack = []
        directories = path.split("/")
        for directory in directories:
            print('directory:', directory)
            if not directory or directory == ".":
                continue
            elif directory == "..":
                if stack: stack.pop()
            else:
                stack.append(directory)
        print('stack:', stack)
        return "/" + "/".join(stack)
        