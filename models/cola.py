class Cola:
    def __init__(self):
        self.items = []

    def esta_vacia(self):
        return len(self.items) == 0

    def agregar(self, elemento):
        if elemento and elemento.strip():
            self.items.append(elemento)
            return True
        return False

    def eliminar_ultimo(self):
        if not self.esta_vacia() and len(self.items) > 1:
            self.items.pop()
            return True
        return False

    def contar_objetos(self):
        return len(self.items)

    def limpiar(self):
        self.items = []

    def atender(self):
        if not self.esta_vacia():
            return self.items.pop(0)
        return None